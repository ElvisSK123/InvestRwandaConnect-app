import React, { useState, useEffect } from 'react';
import { authService, goalService, listingService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Checkbox } from "@/Components/ui/checkbox";
import { Slider } from "@/Components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Target, TrendingUp, Calendar, DollarSign, Lightbulb, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/Components/Landing/Footer";
import ListingCard from "@/Components/Marketplace/ListingCard";

const categories = [
  "agriculture", "technology", "hospitality", "manufacturing",
  "energy", "healthcare", "education", "finance", "infrastructure", "retail"
];

const types = ["business", "startup", "real_estate", "project"];

export default function InvestmentGoals() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    target_amount: 50000,
    timeline_months: 12,
    risk_tolerance: "medium",
    preferred_categories: [],
    preferred_types: [],
    min_roi: 10,
    max_investment_per_opportunity: 25000,
    status: "active"
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .catch(() => window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`);
  }, []);

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: () => goalService.getAll({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => listingService.getAll({ status: 'approved' }),
  });

  const activeGoal = goals.find(g => g.status === 'active');

  useEffect(() => {
    if (activeGoal) {
      setFormData(activeGoal);
    }
  }, [activeGoal]);

  const saveGoalMutation = useMutation({
    mutationFn: async (data) => {
      if (activeGoal) {
        return await goalService.update(activeGoal.id, data);
      } else {
        return await goalService.create({ ...data, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const handleSave = () => {
    saveGoalMutation.mutate(formData);
  };

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      preferred_categories: prev.preferred_categories.includes(cat)
        ? prev.preferred_categories.filter(c => c !== cat)
        : [...prev.preferred_categories, cat]
    }));
  };

  const toggleType = (type) => {
    setFormData(prev => ({
      ...prev,
      preferred_types: prev.preferred_types.includes(type)
        ? prev.preferred_types.filter(t => t !== type)
        : [...prev.preferred_types, type]
    }));
  };

  // Smart recommendations based on goals
  const getRecommendations = () => {
    if (!activeGoal) return [];

    return listings
      .filter(listing => {
        // Filter by categories if specified
        if (activeGoal.preferred_categories?.length > 0 &&
          !activeGoal.preferred_categories.includes(listing.category)) {
          return false;
        }

        // Filter by types if specified
        if (activeGoal.preferred_types?.length > 0 &&
          !activeGoal.preferred_types.includes(listing.type)) {
          return false;
        }

        // Filter by max investment
        if (activeGoal.max_investment_per_opportunity &&
          listing.asking_price > activeGoal.max_investment_per_opportunity) {
          return false;
        }

        // Filter by min ROI
        if (activeGoal.min_roi && listing.projected_roi &&
          listing.projected_roi < activeGoal.min_roi) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Prioritize by ROI match
        const aRoiScore = a.projected_roi || 0;
        const bRoiScore = b.projected_roi || 0;
        return bRoiScore - aRoiScore;
      })
      .slice(0, 6);
  };

  const recommendations = getRecommendations();

  const progressToGoal = activeGoal ?
    Math.min(100, ((activeGoal.target_amount - activeGoal.target_amount) / activeGoal.target_amount) * 100) : 0;

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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="w-12 h-12 text-white" />
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Investment Goals
              </h1>
            </div>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Set your targets and get personalized opportunity recommendations
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="goals">
              <Target className="w-4 h-4 mr-2" />
              My Goals
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Sparkles className="w-4 h-4 mr-2" />
              Recommendations
              {recommendations.length > 0 && (
                <Badge className="ml-2 bg-emerald-500">{recommendations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Goal Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Set Your Investment Goals</CardTitle>
                    <CardDescription>
                      Define your targets to receive tailored investment recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Target Amount */}
                    <div className="space-y-2">
                      <Label>Target Investment Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          className="pl-9"
                          value={formData.target_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, target_amount: Number(e.target.value) }))}
                        />
                      </div>
                      <p className="text-sm text-slate-500">
                        ${formData.target_amount?.toLocaleString()} total goal
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                      <Label>Investment Timeline</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          className="pl-9"
                          value={formData.timeline_months}
                          onChange={(e) => setFormData(prev => ({ ...prev, timeline_months: Number(e.target.value) }))}
                        />
                      </div>
                      <p className="text-sm text-slate-500">
                        {formData.timeline_months} months ({(formData.timeline_months / 12).toFixed(1)} years)
                      </p>
                    </div>

                    {/* Risk Tolerance */}
                    <div className="space-y-3">
                      <Label>Risk Tolerance</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {['low', 'medium', 'high'].map(risk => (
                          <Button
                            key={risk}
                            variant={formData.risk_tolerance === risk ? 'default' : 'outline'}
                            onClick={() => setFormData(prev => ({ ...prev, risk_tolerance: risk }))}
                            className="capitalize"
                          >
                            {risk}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Min ROI */}
                    <div className="space-y-2">
                      <Label>Minimum ROI (%)</Label>
                      <Slider
                        value={[formData.min_roi || 0]}
                        onValueChange={([val]) => setFormData(prev => ({ ...prev, min_roi: val }))}
                        max={50}
                        step={1}
                      />
                      <p className="text-sm text-slate-500">At least {formData.min_roi}% return expected</p>
                    </div>

                    {/* Max per opportunity */}
                    <div className="space-y-2">
                      <Label>Maximum Per Opportunity</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          className="pl-9"
                          value={formData.max_investment_per_opportunity}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_investment_per_opportunity: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    {/* Preferred Categories */}
                    <div className="space-y-3">
                      <Label>Preferred Categories</Label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <Badge
                            key={cat}
                            variant={formData.preferred_categories?.includes(cat) ? 'default' : 'outline'}
                            className="cursor-pointer capitalize"
                            onClick={() => toggleCategory(cat)}
                          >
                            {formData.preferred_categories?.includes(cat) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {cat.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Types */}
                    <div className="space-y-3">
                      <Label>Preferred Investment Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {types.map(type => (
                          <Badge
                            key={type}
                            variant={formData.preferred_types?.includes(type) ? 'default' : 'outline'}
                            className="cursor-pointer capitalize"
                            onClick={() => toggleType(type)}
                          >
                            {formData.preferred_types?.includes(type) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleSave}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={saveGoalMutation.isPending}
                    >
                      {saveGoalMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Target className="w-4 h-4 mr-2" />
                      )}
                      {activeGoal ? 'Update Goals' : 'Save Goals'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Card */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Goal Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">Target Amount</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        ${formData.target_amount?.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Timeline</span>
                        <span className="font-semibold">{formData.timeline_months} months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Risk Level</span>
                        <span className="font-semibold capitalize">{formData.risk_tolerance}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Min ROI</span>
                        <span className="font-semibold">{formData.min_roi}%</span>
                      </div>
                    </div>

                    {activeGoal && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-emerald-600 text-sm">
                          <Lightbulb className="w-4 h-4" />
                          <span>{recommendations.length} opportunities match your goals</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {!activeGoal ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Set Your Goals First</h3>
                  <p className="text-slate-500 mb-6">
                    Define your investment goals to receive personalized recommendations
                  </p>
                  <Button onClick={() => document.querySelector('[value="goals"]').click()}>
                    Set Investment Goals
                  </Button>
                </CardContent>
              </Card>
            ) : recommendations.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Matches Found</h3>
                  <p className="text-slate-500 mb-6">
                    Try adjusting your goals or preferences to see more opportunities
                  </p>
                  <Button variant="outline" onClick={() => document.querySelector('[value="goals"]').click()}>
                    Adjust Goals
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
                    <p className="text-slate-600 mt-1">
                      {recommendations.length} opportunities matching your investment goals
                    </p>
                  </div>
                  <Badge className="bg-emerald-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Matched
                  </Badge>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {recommendations.map((listing, index) => (
                    <ListingCard key={listing.id} listing={listing} index={index} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}