import React, { useState, useEffect } from 'react';
import { authService, listingService, analyticsService, messageService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  Eye, MessageSquare, TrendingUp, Users, Globe,
  BarChart3, Loader2, Calendar, ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";

export default function SellerAnalytics() {
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, []);

  const { data: myListings = [] } = useQuery({
    queryKey: ['myListings', user?.id],
    queryFn: () => listingService.getAll({ seller_id: user?.id }),
    enabled: !!user?.id
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['sellerAnalytics', user?.id],
    queryFn: () => analyticsService.getAll({ seller_id: user?.id, sort: '-date', limit: 100 }),
    enabled: !!user?.id
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['sellerMessages', user?.id],
    queryFn: () => messageService.getAll({ recipient_id: user?.id }),
    enabled: !!user?.id
  });

  // Calculate metrics
  const totalViews = myListings.reduce((sum, l) => sum + (l.views_count || 0), 0);
  const totalInquiries = myListings.reduce((sum, l) => sum + (l.inquiries_count || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(2) : 0;
  const avgViewsPerListing = myListings.length > 0 ? (totalViews / myListings.length).toFixed(0) : 0;

  const recentAnalytics = analytics.filter(a => {
    const date = new Date(a.date);
    return date >= subDays(new Date(), dateRange);
  });

  const uniqueCountries = [...new Set(analytics.flatMap(a => a.visitor_countries || []))];

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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-purple-100">Track your listings performance</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-500">Total Views</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">{avgViewsPerListing} per listing</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-500">Inquiries</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalInquiries}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {conversionRate}% conversion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-500">Active Listings</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {myListings.filter(l => l.status === 'approved').length}
              </p>
              <p className="text-xs text-slate-400 mt-1">of {myListings.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-500">Countries</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{uniqueCountries.length}</p>
              <p className="text-xs text-slate-400 mt-1">visitor locations</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">By Listing</TabsTrigger>
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAnalytics.slice(0, 10).map((day, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">
                            {format(new Date(day.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600">{day.views} views</span>
                          <span className="text-emerald-600">{day.inquiries} inquiries</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Views</span>
                      <span className="text-sm font-semibold">{totalViews}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Messages</span>
                      <span className="text-sm font-semibold">{messages.length}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full"
                        style={{ width: `${totalViews > 0 ? (messages.length / totalViews * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Inquiries</span>
                      <span className="text-sm font-semibold">{totalInquiries}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-emerald-500 h-3 rounded-full"
                        style={{ width: `${conversionRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Listing Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myListings.map((listing) => {
                    const listingConversion = listing.views_count > 0
                      ? ((listing.inquiries_count / listing.views_count) * 100).toFixed(1)
                      : 0;

                    return (
                      <div key={listing.id} className="p-4 rounded-xl border border-slate-200">
                        <div className="flex items-start gap-4">
                          <img
                            src={listing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                            alt=""
                            className="w-20 h-14 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-2">{listing.title}</h3>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Views</p>
                                <p className="font-semibold">{listing.views_count || 0}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Inquiries</p>
                                <p className="font-semibold">{listing.inquiries_count || 0}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Conversion</p>
                                <p className="font-semibold">{listingConversion}%</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Status</p>
                                <p className="font-semibold capitalize">{listing.status}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uniqueCountries.map((country, idx) => {
                    const countryCount = analytics.filter(a =>
                      a.visitor_countries?.includes(country)
                    ).length;

                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{country}</span>
                        </div>
                        <span className="text-sm text-slate-500">{countryCount} visits</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}