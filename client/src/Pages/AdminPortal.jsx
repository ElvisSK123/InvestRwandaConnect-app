import React, { useState, useEffect } from 'react';
import { authService, listingService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/Components/ui/dialog";
import {
  Building2, CheckCircle2, XCircle, Clock, Eye, Search, Loader2,
  DollarSign, MapPin, Calendar, Users, TrendingUp, FileText,
  AlertCircle, Shield, ChevronRight, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminPortal() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      if (u?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        window.location.href = '/';
        return;
      }
      setUser(u);
    }).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, []);

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['allListings'],
    queryFn: () => listingService.getAllForAdmin({ sort: '-created_at', limit: 500 }),
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  const updateListingMutation = useMutation({
    mutationFn: async ({ id, status, verification_status, notes }) => {
      return await listingService.updateStatus(id, status, verification_status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      const action = variables.status === 'approved' ? 'approved ✅' : 'rejected ❌';
      toast.success(`Listing ${action}`, {
        description: `The entrepreneur will be notified about this decision.`
      });
      setShowReviewDialog(false);
      setSelectedListing(null);
      setReviewNotes('');
    },
    onError: (error) => {
      toast.error('Failed to update listing', {
        description: error.response?.data?.error || 'Please try again'
      });
    }
  });

  // Filter listings
  const pendingListings = listings.filter(l => l.status === 'pending_review');
  const approvedListings = listings.filter(l => l.status === 'approved');
  const rejectedListings = listings.filter(l => l.status === 'rejected');

  // Search filter
  const filteredListings = (list) => {
    if (!searchQuery) return list;
    return list.filter(l =>
      l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const stats = {
    totalListings: listings.length,
    pendingReview: pendingListings.length,
    approved: approvedListings.length,
    rejected: rejectedListings.length,
  };

  const handleOpenReview = (listing) => {
    setSelectedListing(listing);
    setShowReviewDialog(true);
  };

  const handleApproveListing = () => {
    if (!selectedListing) return;

    const verification_status = selectedListing.rdb_registration_number
      ? 'rdb_verified'
      : 'documents_submitted';

    updateListingMutation.mutate({
      id: selectedListing.id,
      status: 'approved',
      verification_status: verification_status,
      notes: reviewNotes
    });
  };

  const handleRejectListing = () => {
    if (!selectedListing) return;

    if (!reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    updateListingMutation.mutate({
      id: selectedListing.id,
      status: 'rejected',
      notes: reviewNotes
    });
  };

  const handleQuickApprove = (listing, e) => {
    e.stopPropagation();

    const verification_status = listing.rdb_registration_number
      ? 'rdb_verified'
      : 'documents_submitted';

    updateListingMutation.mutate({
      id: listing.id,
      status: 'approved',
      verification_status: verification_status,
      notes: 'Quick approval'
    });
  };

  const handleQuickReject = (listing, e) => {
    e.stopPropagation();
    setSelectedListing(listing);
    setShowReviewDialog(true);
  };

  const ListingCard = ({ listing, showActions = true }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
      onClick={() => handleOpenReview(listing)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{listing.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4" />
              {listing.location}, {listing.district}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">
              ${listing.asking_price?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{listing.category}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{listing.type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              {format(new Date(listing.created_at || listing.created_date), 'MMM d, yyyy')}
            </span>
          </div>
          {listing.projected_roi && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{listing.projected_roi}% ROI</span>
            </div>
          )}
        </div>

        {/* Government Verification */}
        {listing.rdb_registration_number && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-emerald-900">Government Registered</span>
            </div>
            <p className="text-xs text-emerald-700 mt-1">RDB: {listing.rdb_registration_number}</p>
            {listing.rra_tin && (
              <p className="text-xs text-emerald-700">TIN: {listing.rra_tin}</p>
            )}
          </div>
        )}

        {/* Description Preview */}
        {listing.short_description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {listing.short_description}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenReview(listing);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Full Review
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={(e) => handleQuickReject(listing, e)}
                disabled={updateListingMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={(e) => handleQuickApprove(listing, e)}
                disabled={updateListingMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-emerald-900 py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-amber-500/20 text-amber-300 border-0 mb-3">
              <Shield className="w-3 h-3 mr-1" />
              Admin Portal
            </Badge>
            <h1 className="text-4xl font-bold text-white mb-2">
              Listing Review Center
            </h1>
            <p className="text-slate-300">
              Review and approve investment opportunities submitted by entrepreneurs
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Pending Review</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.pendingReview}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.approved}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Total Listings</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalListings}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by title, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-base"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="relative">
              Pending Review
              {stats.pendingReview > 0 && (
                <Badge className="ml-2 bg-amber-500 text-white">{stats.pendingReview}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              <Badge className="ml-2 bg-emerald-100 text-emerald-700">{stats.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <Badge className="ml-2 bg-red-100 text-red-700">{stats.rejected}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all">All Listings</TabsTrigger>
          </TabsList>

          {/* Pending Listings */}
          <TabsContent value="pending">
            {listingsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : filteredListings(pendingListings).length === 0 ? (
              <Card>
                <CardContent className="py-20">
                  <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-500">No listings are waiting for review</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredListings(pendingListings).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approved Listings */}
          <TabsContent value="approved">
            {filteredListings(approvedListings).length === 0 ? (
              <Card>
                <CardContent className="py-20">
                  <div className="text-center">
                    <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Approved Listings</h3>
                    <p className="text-slate-500">Approved listings will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredListings(approvedListings).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rejected Listings */}
          <TabsContent value="rejected">
            {filteredListings(rejectedListings).length === 0 ? (
              <Card>
                <CardContent className="py-20">
                  <div className="text-center">
                    <XCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Rejected Listings</h3>
                    <p className="text-slate-500">Rejected listings will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredListings(rejectedListings).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Listings */}
          <TabsContent value="all">
            {filteredListings(listings).length === 0 ? (
              <Card>
                <CardContent className="py-20">
                  <div className="text-center">
                    <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Listings Found</h3>
                    <p className="text-slate-500">Try adjusting your search</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredListings(listings).map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    showActions={listing.status === 'pending_review'}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Review Listing</DialogTitle>
            <DialogDescription>
              Review all details before approving or rejecting this listing
            </DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="pb-4 border-b">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {selectedListing.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedListing.location}, {selectedListing.district}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedListing.created_at || selectedListing.created_date), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>

              {/* Price & Investment Details */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-500 mb-1">Asking Price</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ${selectedListing.asking_price?.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-500 mb-1">Minimum Investment</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${selectedListing.minimum_investment?.toLocaleString() || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Business Details */}
              <div>
                <Label className="text-base font-semibold mb-2">Business Details</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-slate-500">Category</p>
                    <p className="font-medium">{selectedListing.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-medium">{selectedListing.type}</p>
                  </div>
                  {selectedListing.year_established && (
                    <div>
                      <p className="text-sm text-slate-500">Year Established</p>
                      <p className="font-medium">{selectedListing.year_established}</p>
                    </div>
                  )}
                  {selectedListing.employees && (
                    <div>
                      <p className="text-sm text-slate-500">Employees</p>
                      <p className="font-medium">{selectedListing.employees}</p>
                    </div>
                  )}
                  {selectedListing.projected_roi && (
                    <div>
                      <p className="text-sm text-slate-500">Projected ROI</p>
                      <p className="font-medium">{selectedListing.projected_roi}%</p>
                    </div>
                  )}
                  {selectedListing.annual_revenue && (
                    <div>
                      <p className="text-sm text-slate-500">Annual Revenue</p>
                      <p className="font-medium">${selectedListing.annual_revenue?.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Government Registration */}
              {(selectedListing.rdb_registration_number || selectedListing.rra_tin) && (
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <Label className="text-base font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Government Registration
                  </Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {selectedListing.rdb_registration_number && (
                      <div>
                        <p className="text-sm text-emerald-700">RDB Registration</p>
                        <p className="font-medium text-emerald-900">{selectedListing.rdb_registration_number}</p>
                      </div>
                    )}
                    {selectedListing.rra_tin && (
                      <div>
                        <p className="text-sm text-emerald-700">RRA TIN</p>
                        <p className="font-medium text-emerald-900">{selectedListing.rra_tin}</p>
                      </div>
                    )}
                    {selectedListing.land_title_number && (
                      <div>
                        <p className="text-sm text-emerald-700">Land Title Number</p>
                        <p className="font-medium text-emerald-900">{selectedListing.land_title_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <Label className="text-base font-semibold mb-2">Description</Label>
                <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                  {selectedListing.description}
                </p>
              </div>

              {/* Highlights */}
              {selectedListing.highlights && selectedListing.highlights.length > 0 && (
                <div>
                  <Label className="text-base font-semibold mb-2">Key Highlights</Label>
                  <ul className="mt-2 space-y-2">
                    {selectedListing.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Images */}
              {selectedListing.images && selectedListing.images.length > 0 && (
                <div>
                  <Label className="text-base font-semibold mb-2">Property Images</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {selectedListing.images.slice(0, 6).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Property ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Review Notes */}
              <div>
                <Label htmlFor="reviewNotes" className="text-base font-semibold">
                  Admin Review Notes {selectedListing.status === 'pending_review' && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={selectedListing.status === 'pending_review'
                    ? "Add notes about this listing (required for rejection)..."
                    : "Add review notes (optional)..."}
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  These notes are for internal record keeping
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
            >
              Cancel
            </Button>
            {selectedListing?.status === 'pending_review' && (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleRejectListing}
                  disabled={updateListingMutation.isPending}
                >
                  {updateListingMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject Listing
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleApproveListing}
                  disabled={updateListingMutation.isPending}
                >
                  {updateListingMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Approve Listing
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
