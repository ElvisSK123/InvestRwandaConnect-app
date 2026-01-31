import React, { useState, useEffect } from 'react';
import { authService, listingService, investmentService, inquiryService, messageService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  Building2, TrendingUp, Eye, MessageSquare, Plus,
  Clock, CheckCircle2, XCircle, AlertCircle, Loader2,
  DollarSign, FileText, Users, ArrowUpRight, Mail
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

const statusBadges = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600", icon: FileText },
  pending_review: { label: "Pending Review", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  under_offer: { label: "Under Offer", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  sold: { label: "Sold", color: "bg-purple-100 text-purple-700", icon: CheckCircle2 },
};

const investmentStatusBadges = {
  initiated: { label: "Initiated", color: "bg-slate-100 text-slate-600" },
  kyc_pending: { label: "KYC Pending", color: "bg-amber-100 text-amber-700" },
  escrow_funded: { label: "Escrow Funded", color: "bg-blue-100 text-blue-700" },
  under_review: { label: "Under Review", color: "bg-purple-100 text-purple-700" },
  government_approval: { label: "Gov. Approval", color: "bg-cyan-100 text-cyan-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, []);

  // For Entrepreneurs: Get their own listings
  const { data: myListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['myListings', user?.id],
    queryFn: () => listingService.getMyListings(),
    enabled: !!user?.id && (user?.role === 'entrepreneur' || user?.role === 'seller')
  });

  // For Investors: Get approved listings from entrepreneurs to browse
  const { data: approvedListings = [], isLoading: approvedListingsLoading } = useQuery({
    queryKey: ['approvedListings'],
    queryFn: () => listingService.getAll({ status: 'approved', sort: '-created_date', limit: 20 }),
    enabled: !!user?.id && user?.role === 'investor'
  });

  const { data: myInvestments = [], isLoading: investmentsLoading } = useQuery({
    queryKey: ['myInvestments', user?.id],
    queryFn: () => investmentService.getAll({ investor_id: user?.id, sort: '-created_date' }),
    enabled: !!user?.id
  });

  const { data: myInquiries = [], isLoading: inquiriesLoading } = useQuery({
    queryKey: ['myInquiries', user?.id],
    queryFn: () => inquiryService.getAll({ seller_id: user?.id, sort: '-created_date' }),
    enabled: !!user?.id
  });

  const { data: myMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['myMessages', user?.id],
    queryFn: async () => {
      const sent = await messageService.getAll({ sender_id: user?.id, sort: '-created_date', limit: 50 });
      const received = await messageService.getAll({ recipient_id: user?.id, sort: '-created_date', limit: 50 });
      return [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.id
  });

  const unreadMessages = myMessages.filter(m => m.recipient_id === user?.id && !m.read).length;

  const stats = {
    totalListings: myListings.length,
    activeListings: myListings.filter(l => l.status === 'approved').length,
    totalViews: myListings.reduce((sum, l) => sum + (l.views_count || 0), 0),
    totalInquiries: myListings.reduce((sum, l) => sum + (l.inquiries_count || 0), 0),
    investmentsMade: myInvestments.length,
    totalInvested: myInvestments.reduce((sum, i) => sum + (i.amount || 0), 0),
    unreadMessages: unreadMessages,
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.full_name?.split(' ')[0] || 'Investor'}
            </h1>
            <p className="text-emerald-100">
              Manage your listings and track your investments
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Listings</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.activeListings}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Views</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalViews}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Messages</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.unreadMessages}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center relative">
                  <MessageSquare className="w-6 h-6 text-rose-600" />
                  {stats.unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stats.unreadMessages}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Inquiries</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalInquiries}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Investments</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.investmentsMade}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {user?.role === 'investor' && (
                <TabsTrigger value="browse">Browse Opportunities</TabsTrigger>
              )}
              {(user?.role === 'entrepreneur' || user?.role === 'seller') && (
                <TabsTrigger value="listings">My Listings</TabsTrigger>
              )}
              <TabsTrigger value="investments">My Investments</TabsTrigger>
              <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            </TabsList>

            {(user?.role === 'entrepreneur' || user?.role === 'seller') && (
              <Link to={createPageUrl("ListOpportunity")}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Listing
                </Button>
              </Link>
            )}
          </div>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Listings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Listings</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('listings')}>
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {listingsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : myListings.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No listings yet</p>
                      <Link to={createPageUrl("ListOpportunity")}>
                        <Button variant="outline" size="sm" className="mt-3">
                          Create Your First Listing
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myListings.slice(0, 3).map((listing) => {
                        const status = statusBadges[listing.status] || statusBadges.draft;
                        return (
                          <Link key={listing.id} to={createPageUrl("ListingDetails") + `?id=${listing.id}`}>
                            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                              <img
                                src={listing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                                alt=""
                                className="w-16 h-12 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">{listing.title}</p>
                                <p className="text-sm text-slate-500">${listing.asking_price?.toLocaleString()}</p>
                              </div>
                              <Badge className={status.color}>{status.label}</Badge>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Investments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Investments</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('investments')}>
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {investmentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : myInvestments.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No investments yet</p>
                      <Link to={createPageUrl("Marketplace")}>
                        <Button variant="outline" size="sm" className="mt-3">
                          Browse Opportunities
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myInvestments.slice(0, 3).map((investment) => {
                        const status = investmentStatusBadges[investment.status] || investmentStatusBadges.initiated;
                        return (
                          <div key={investment.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900">${investment.amount?.toLocaleString()}</p>
                              <p className="text-sm text-slate-500">
                                {format(new Date(investment.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge className={status.color}>{status.label}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Browse Opportunities Tab - For Investors */}
          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle>Available Investment Opportunities</CardTitle>
                <p className="text-sm text-slate-500">Browse approved business opportunities from entrepreneurs across Rwanda</p>
              </CardHeader>
              <CardContent className="p-6">
                {approvedListingsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : approvedListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No opportunities available yet</h3>
                    <p className="text-slate-500 mb-6">Check back soon for new investment opportunities</p>
                    <Link to={createPageUrl("Marketplace")}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        Visit Marketplace
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedListings.map((listing) => {
                      const status = statusBadges[listing.status] || statusBadges.approved;
                      const StatusIcon = status.icon;
                      return (
                        <div key={listing.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all">
                          <img
                            src={listing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                            alt=""
                            className="w-24 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 mb-1">{listing.title}</p>
                            <p className="text-sm text-slate-500 mb-1">{listing.location}, {listing.district}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <Badge variant="secondary" className="text-xs">{listing.category}</Badge>
                              <Badge variant="outline" className="text-xs">{listing.type}</Badge>
                              {listing.projected_roi && (
                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                  <TrendingUp className="w-3 h-3" />
                                  {listing.projected_roi}% ROI
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500 mb-1">Investment</p>
                            <p className="text-xl font-bold text-emerald-600">${listing.asking_price?.toLocaleString()}</p>
                            {listing.minimum_investment && (
                              <p className="text-xs text-slate-400">Min: ${listing.minimum_investment?.toLocaleString()}</p>
                            )}
                          </div>
                          <Link to={createPageUrl("ListingDetails") + `?id=${listing.id}`}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Listings Tab - For Entrepreneurs */}
          <TabsContent value="listings">
            <Card>
              <CardContent className="p-6">
                {listingsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : myListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No listings yet</h3>
                    <p className="text-slate-500 mb-6">Start by creating your first investment opportunity</p>
                    <Link to={createPageUrl("ListOpportunity")}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Listing
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myListings.map((listing) => {
                      const status = statusBadges[listing.status] || statusBadges.draft;
                      const StatusIcon = status.icon;
                      return (
                        <div key={listing.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                          <img
                            src={listing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                            alt=""
                            className="w-20 h-14 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900">{listing.title}</p>
                            <p className="text-sm text-slate-500">{listing.location}, {listing.district}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {listing.views_count || 0} views
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {listing.inquiries_count || 0} inquiries
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">${listing.asking_price?.toLocaleString()}</p>
                            <Badge className={`${status.color} mt-1`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <Link to={createPageUrl("ListingDetails") + `?id=${listing.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </div>
                      );
                    })}
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
                ) : myInvestments.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No investments yet</h3>
                    <p className="text-slate-500 mb-6">Start exploring investment opportunities in Rwanda</p>
                    <Link to={createPageUrl("Marketplace")}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        Browse Marketplace
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myInvestments.map((investment) => {
                      const status = investmentStatusBadges[investment.status] || investmentStatusBadges.initiated;
                      return (
                        <div key={investment.id} className="p-4 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-2xl font-bold text-slate-900">${investment.amount?.toLocaleString()}</p>
                              <p className="text-sm text-slate-500">
                                Started {format(new Date(investment.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge className={status.color}>{status.label}</Badge>
                          </div>

                          {/* Progress Timeline */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {['KYC', 'Escrow', 'Review', 'Approval', 'Complete'].map((step, idx) => (
                              <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${idx < 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                  {idx < 2 ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                {idx < 4 && <div className={`w-8 h-0.5 ${idx < 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card>
              <CardContent className="p-6">
                {inquiriesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : myInquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No inquiries yet</h3>
                    <p className="text-slate-500">You'll see investor inquiries here once your listings are approved</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myInquiries.map((inquiry) => (
                      <div key={inquiry.id} className="p-4 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-900">{inquiry.subject}</p>
                          <Badge className={inquiry.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}>
                            {inquiry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{inquiry.message}</p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(inquiry.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}