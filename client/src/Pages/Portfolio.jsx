import React, { useState, useEffect } from 'react';
import { authService, investmentService, portfolioService, listingService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  TrendingUp, TrendingDown, DollarSign, Percent, Calendar,
  Building2, ArrowUpRight, ArrowDownRight, Loader2, PieChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Footer from "@/Components/Landing/Footer";

export default function Portfolio() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, []);

  const { data: investments = [], isLoading: investmentsLoading } = useQuery({
    queryKey: ['myInvestments', user?.id],
    queryFn: () => investmentService.getAll({ investor_id: user?.id, sort: '-created_date' }),
    enabled: !!user?.id
  });

  const { data: portfolios = [], isLoading: portfoliosLoading } = useQuery({
    queryKey: ['myPortfolio', user?.id],
    queryFn: () => portfolioService.getAll({ investor_id: user?.id }),
    enabled: !!user?.id
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['portfolioListings'],
    queryFn: () => listingService.getAll({ sort: '-created_date', limit: 200 }),
  });

  // Calculate portfolio metrics
  const totalInvested = portfolios.reduce((sum, p) => sum + (p.initial_investment || 0), 0);
  const currentValue = portfolios.reduce((sum, p) => sum + (p.current_value || p.initial_investment || 0), 0);
  const totalReturn = currentValue - totalInvested;
  const totalROI = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(2) : 0;
  const totalDividends = portfolios.reduce((sum, p) => sum + (p.dividends_received || 0), 0);

  const activeInvestments = portfolios.filter(p => p.status === 'active').length;
  const completedInvestments = investments.filter(i => i.status === 'completed').length;

  if (!user || investmentsLoading || portfoliosLoading) {
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Investment Portfolio</h1>
                <p className="text-emerald-100">Track your investments and performance</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-500">Total Invested</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">${totalInvested.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-500">Current Value</p>
              </div>
              <p className="text-3xl font-bold text-emerald-600">${currentValue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-500">Total ROI</p>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-3xl font-bold ${parseFloat(totalROI) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {totalROI}%
                </p>
                {parseFloat(totalROI) >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-500">Dividends</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">${totalDividends.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <p className="text-sm text-slate-500">Active</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{activeInvestments}</p>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Table */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Investments</TabsTrigger>
            <TabsTrigger value="all">All Investments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolios.filter(p => p.status === 'active').length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No active investments</h3>
                    <p className="text-slate-500 mb-6">Start investing to build your portfolio</p>
                    <Link to={createPageUrl("Marketplace")}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        Explore Opportunities
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {portfolios.filter(p => p.status === 'active').map((portfolio) => {
                      const listing = listings.find(l => l.id === portfolio.listing_id);
                      const roi = portfolio.initial_investment > 0
                        ? (((portfolio.current_value || portfolio.initial_investment) - portfolio.initial_investment) / portfolio.initial_investment * 100).toFixed(2)
                        : 0;

                      return (
                        <div key={portfolio.id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                          <div className="flex items-start gap-4">
                            <img
                              src={listing?.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                              alt=""
                              className="w-20 h-14 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-slate-900">{listing?.title || 'Investment'}</h3>
                                  <p className="text-sm text-slate-500">{listing?.location}</p>
                                </div>
                                <Badge className={parseFloat(roi) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                  {parseFloat(roi) >= 0 ? '+' : ''}{roi}% ROI
                                </Badge>
                              </div>

                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-slate-500">Invested</p>
                                  <p className="font-semibold">${portfolio.initial_investment?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Current Value</p>
                                  <p className="font-semibold">${(portfolio.current_value || portfolio.initial_investment)?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Ownership</p>
                                  <p className="font-semibold">{portfolio.ownership_percentage || 0}%</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Investment Date</p>
                                  <p className="font-semibold">
                                    {portfolio.investment_date ? format(new Date(portfolio.investment_date), 'MMM yyyy') : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {investments.map((investment) => {
                    const listing = listings.find(l => l.id === investment.listing_id);
                    return (
                      <div key={investment.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200">
                        <img
                          src={listing?.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                          alt=""
                          className="w-16 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{listing?.title}</p>
                          <p className="text-sm text-slate-500">${investment.amount?.toLocaleString()}</p>
                        </div>
                        <Badge className={
                          investment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            investment.status === 'escrow_funded' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                        }>
                          {investment.status?.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-slate-400">
                          {format(new Date(investment.created_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Diversification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      portfolios.reduce((acc, p) => {
                        const listing = listings.find(l => l.id === p.listing_id);
                        const category = listing?.category || 'other';
                        acc[category] = (acc[category] || 0) + (p.initial_investment || 0);
                        return acc;
                      }, {})
                    ).map(([category, amount]) => {
                      const percentage = totalInvested > 0 ? ((amount / totalInvested) * 100).toFixed(1) : 0;
                      return (
                        <div key={category}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium capitalize">{category.replace('_', ' ')}</span>
                            <span className="text-sm text-slate-500">{percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Total Return</span>
                    <span className={`font-bold ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Average ROI</span>
                    <span className="font-bold text-slate-900">{totalROI}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Total Dividends</span>
                    <span className="font-bold text-slate-900">${totalDividends.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Completed Investments</span>
                    <span className="font-bold text-slate-900">{completedInvestments}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}