import React, { useState, useEffect } from 'react';
import { authService, listingService, investmentService, kycService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/Components/ui/dialog";
import {
  Building2, Users, FileCheck, Shield, TrendingUp,
  CheckCircle2, XCircle, Clock, Eye, Search, Loader2,
  DollarSign, AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      if (u.role !== 'admin') {
        window.location.href = '/';
      }
      setUser(u);
    }).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, []);

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['allListings'],
    queryFn: () => listingService.getAllForAdmin({ sort: '-created_date', limit: 200 }),
    enabled: !!user && user.role === 'admin'
  });

  const { data: investments = [], isLoading: investmentsLoading } = useQuery({
    queryKey: ['allInvestments'],
    queryFn: () => investmentService.getAll({ sort: '-created_date', limit: 100 }),
  });

  const { data: kycRequests = [], isLoading: kycLoading } = useQuery({
    queryKey: ['allKYC'],
    queryFn: () => kycService.getAll({ status: 'documents_submitted', sort: '-created_date', limit: 50 }),
  });

  const updateListingMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await listingService.updateStatus(id, data.status, data.verification_status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      const action = variables.data.status === 'approved' ? 'approved' : 'rejected';
      toast.success(`Listing ${action} successfully!`);
      setSelectedListing(null);
      setReviewNotes('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update listing');
    }
  });

  const updateKYCMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await kycService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allKYC'] });
    }
  });

  const pendingListings = listings.filter(l => l.status === 'pending_review');
  const approvedListings = listings.filter(l => l.status === 'approved');

  const stats = {
    totalListings: listings.length,
    pendingReview: pendingListings.length,
    activeListings: approvedListings.length,
    totalInvestments: investments.length,
    totalValue: investments.reduce((sum, i) => sum + (i.amount || 0), 0),
    pendingKYC: kycRequests.length,
  };

  const handleApproveListing = (listing) => {
    updateListingMutation.mutate({
      id: listing.id,
      data: {
        status: 'approved',
        verification_status: listing.rdb_registration_number ? 'rdb_verified' : 'documents_submitted'
      }
    });
  };

  const handleRejectListing = (listing) => {
    updateListingMutation.mutate({
      id: listing.id,
      data: {
        status: 'rejected',
      }
    });
  };

  const handleApproveKYC = (kyc) => {
    updateKYCMutation.mutate({
      id: kyc.id,
      data: {
        status: 'verified',
        verified_date: new Date().toISOString()
      }
    });
  };

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
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 py-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-amber-500/20 text-amber-400 border-0 mb-2">Admin Panel</Badge>
            <h1 className="text-3xl font-bold text-white">Platform Administration</h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalListings}</p>
                  <p className="text-xs text-slate-500">Total Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingReview}</p>
                  <p className="text-xs text-slate-500">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeListings}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalInvestments}</p>
                  <p className="text-xs text-slate-500">Investments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">${(stats.totalValue / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-slate-500">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingKYC}</p>
                  <p className="text-xs text-slate-500">KYC Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Listings
                {stats.pendingReview > 0 && (
                  <Badge className="ml-2 bg-amber-500 text-white">{stats.pendingReview}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All Listings</TabsTrigger>
              <TabsTrigger value="kyc">
                KYC Requests
                {stats.pendingKYC > 0 && (
                  <Badge className="ml-2 bg-rose-500 text-white">{stats.pendingKYC}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-6">
                {listingsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : pendingListings.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
                    <p className="text-slate-500">No listings pending review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingListings.map((listing) => (
                      <div key={listing.id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                        <div className="flex items-start gap-4">
                          <img
                            src={listing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                            alt=""
                            className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-slate-900">{listing.title}</h3>
                                <p className="text-sm text-slate-500">{listing.location}, {listing.district}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                  <span>Category: {listing.category}</span>
                                  <span>Type: {listing.type}</span>
                                  <span>Submitted: {format(new Date(listing.created_date), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                              <p className="text-xl font-bold text-slate-900">${listing.asking_price?.toLocaleString()}</p>
                            </div>

                            {listing.rdb_registration_number && (
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  RDB: {listing.rdb_registration_number}
                                </Badge>
                                {listing.rra_tin && (
                                  <Badge variant="outline" className="text-xs">
                                    TIN: {listing.rra_tin}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedListing(listing)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleRejectListing(listing)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleApproveListing(listing)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {listings.slice(0, 20).map((listing) => (
                    <div key={listing.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50">
                      <img
                        src={listing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                        alt=""
                        className="w-16 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{listing.title}</p>
                        <p className="text-sm text-slate-500">{listing.location}</p>
                      </div>
                      <Badge className={
                        listing.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          listing.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                            listing.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-600'
                      }>
                        {listing.status?.replace('_', ' ')}
                      </Badge>
                      <p className="font-semibold">${listing.asking_price?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardContent className="p-6">
                {kycLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : kycRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending KYC requests</h3>
                    <p className="text-slate-500">All verification requests have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {kycRequests.map((kyc) => (
                      <div key={kyc.id} className="p-4 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{kyc.full_legal_name}</p>
                            <p className="text-sm text-slate-500">{kyc.nationality} • {kyc.verification_type}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                              <span>ID: {kyc.id_type} - {kyc.id_number}</span>
                              <span>Source: {kyc.source_of_funds}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200"
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproveKYC(kyc)}
                            >
                              Verify
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments">
            <Card>
              <CardContent className="p-6">
                {investmentsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : investments.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No investments yet</h3>
                    <p className="text-slate-500">Investment transactions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {investments.map((inv) => (
                      <div key={inv.id} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">${inv.amount?.toLocaleString()}</p>
                          <p className="text-sm text-slate-500">
                            {format(new Date(inv.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={
                          inv.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            inv.status === 'escrow_funded' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                        }>
                          {inv.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Listing</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={selectedListing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&q=80"}
                  alt=""
                  className="w-32 h-24 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedListing.title}</h3>
                  <p className="text-slate-500">{selectedListing.location}, {selectedListing.district}</p>
                  <p className="text-xl font-bold mt-2">${selectedListing.asking_price?.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-slate-600">{selectedListing.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Government Registration</h4>
                  <div className="space-y-1 text-sm">
                    <p>RDB: {selectedListing.rdb_registration_number || 'Not provided'}</p>
                    <p>TIN: {selectedListing.rra_tin || 'Not provided'}</p>
                    {selectedListing.land_title_number && (
                      <p>Land Title: {selectedListing.land_title_number}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Business Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>Category: {selectedListing.category}</p>
                    <p>Type: {selectedListing.type}</p>
                    {selectedListing.year_established && (
                      <p>Established: {selectedListing.year_established}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Review Notes</h4>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this listing..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedListing(null)}>Cancel</Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200"
              onClick={() => handleRejectListing(selectedListing)}
            >
              Reject
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleApproveListing(selectedListing)}
            >
              Approve Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}