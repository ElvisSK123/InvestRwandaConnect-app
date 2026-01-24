import React, { useState, useEffect } from 'react';
import { authService } from '@/services/api';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Checkbox } from "@/Components/ui/checkbox";
import {
  User, Building2, TrendingUp, Target, Loader2,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const categories = [
  "agriculture", "technology", "hospitality", "manufacturing",
  "energy", "healthcare", "education", "finance", "infrastructure", "retail"
];

const exitStrategies = [
  { value: "ipo", label: "IPO / Public Listing" },
  { value: "acquisition", label: "Acquisition" },
  { value: "management_buyout", label: "Management Buyout" },
  { value: "dividend_income", label: "Dividend Income" },
  { value: "long_term_hold", label: "Long-term Hold" }
];

const challenges = [
  { value: "funding", label: "Funding & Capital" },
  { value: "market_access", label: "Market Access" },
  { value: "scaling", label: "Scaling Operations" },
  { value: "talent", label: "Talent Acquisition" },
  { value: "technology", label: "Technology & Innovation" },
  { value: "regulation", label: "Regulatory Compliance" },
  { value: "competition", label: "Competition" },
  { value: "cash_flow", label: "Cash Flow Management" }
];

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    account_type: 'investor',
    bio: '',
    phone: '',
    investment_preferences: [],
    risk_tolerance: 'moderate',
    industry_focus: [],
    preferred_exit_strategies: [],
    investment_range_min: 50000,
    investment_range_max: 500000,
    investment_horizon: 'medium_term',
    geographic_preferences: [],
    company_size: '',
    growth_stage: '',
    current_challenges: [],
    funding_needs: '',
    annual_revenue: 0,
    employees_count: 0,
    years_in_operation: 0
  });

  useEffect(() => {
    authService.getCurrentUser().then(userData => {
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        ...userData,
        investment_preferences: userData.investment_preferences || [],
        industry_focus: userData.industry_focus || [],
        preferred_exit_strategies: userData.preferred_exit_strategies || [],
        geographic_preferences: userData.geographic_preferences || [],
        current_challenges: userData.current_challenges || []
      }));
    }).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, []);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await authService.updateProfile(data);
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setSaving(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
      setSaving(false);
    }
  });

  const handleSave = async () => {
    setSaving(true);
    await updateMutation.mutateAsync(formData);
  };

  const toggleArrayValue = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const isInvestor = formData.account_type === 'investor' || formData.account_type === 'both';
  const isSeller = formData.account_type === 'seller' || formData.account_type === 'both';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                <p className="text-emerald-100">Manage your investment profile and preferences</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Account Type</Label>
                <div className="flex gap-4 mt-2">
                  {['investor', 'seller', 'both'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="account_type"
                        value={type}
                        checked={formData.account_type === type}
                        onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>

              <div>
                <Label>Bio / Company Description</Label>
                <Textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell us about yourself or your company..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Investor Profile */}
          {isInvestor && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Investment Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Industry Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {categories.map(cat => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={formData.investment_preferences.includes(cat)}
                            onCheckedChange={() => toggleArrayValue('investment_preferences', cat)}
                          />
                          <span className="text-sm capitalize">{cat.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Risk Tolerance</Label>
                    <div className="flex gap-4 mt-2">
                      {['conservative', 'moderate', 'aggressive'].map(risk => (
                        <label key={risk} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="risk_tolerance"
                            value={risk}
                            checked={formData.risk_tolerance === risk}
                            onChange={(e) => setFormData({ ...formData, risk_tolerance: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span className="capitalize">{risk}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Minimum Investment</Label>
                      <Input
                        type="number"
                        value={formData.investment_range_min || ''}
                        onChange={(e) => setFormData({ ...formData, investment_range_min: parseFloat(e.target.value) })}
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <Label>Maximum Investment</Label>
                      <Input
                        type="number"
                        value={formData.investment_range_max || ''}
                        onChange={(e) => setFormData({ ...formData, investment_range_max: parseFloat(e.target.value) })}
                        placeholder="500000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Investment Horizon</Label>
                    <div className="flex gap-4 mt-2">
                      {[
                        { value: 'short_term', label: 'Short-term (1-3 years)' },
                        { value: 'medium_term', label: 'Medium-term (3-7 years)' },
                        { value: 'long_term', label: 'Long-term (7+ years)' }
                      ].map(horizon => (
                        <label key={horizon.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="investment_horizon"
                            value={horizon.value}
                            checked={formData.investment_horizon === horizon.value}
                            onChange={(e) => setFormData({ ...formData, investment_horizon: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{horizon.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Preferred Exit Strategies</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {exitStrategies.map(strategy => (
                        <label key={strategy.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={formData.preferred_exit_strategies.includes(strategy.value)}
                            onCheckedChange={() => toggleArrayValue('preferred_exit_strategies', strategy.value)}
                          />
                          <span className="text-sm">{strategy.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Seller Profile */}
          {isSeller && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Company Size</Label>
                  <div className="flex gap-4 mt-2">
                    {['startup', 'small', 'medium', 'large'].map(size => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="company_size"
                          value={size}
                          checked={formData.company_size === size}
                          onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span className="capitalize">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Growth Stage</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['pre_revenue', 'early_revenue', 'growth', 'mature', 'expansion'].map(stage => (
                      <label key={stage} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="growth_stage"
                          value={stage}
                          checked={formData.growth_stage === stage}
                          onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span className="capitalize text-sm">{stage.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Annual Revenue ($)</Label>
                    <Input
                      type="number"
                      value={formData.annual_revenue || ''}
                      onChange={(e) => setFormData({ ...formData, annual_revenue: parseFloat(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Number of Employees</Label>
                    <Input
                      type="number"
                      value={formData.employees_count || ''}
                      onChange={(e) => setFormData({ ...formData, employees_count: parseInt(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Years in Operation</Label>
                    <Input
                      type="number"
                      value={formData.years_in_operation || ''}
                      onChange={(e) => setFormData({ ...formData, years_in_operation: parseInt(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Current Business Challenges</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {challenges.map(challenge => (
                      <label key={challenge.value} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.current_challenges.includes(challenge.value)}
                          onCheckedChange={() => toggleArrayValue('current_challenges', challenge.value)}
                        />
                        <span className="text-sm">{challenge.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Funding Needs & Use of Funds</Label>
                  <Textarea
                    value={formData.funding_needs || ''}
                    onChange={(e) => setFormData({ ...formData, funding_needs: e.target.value })}
                    rows={3}
                    placeholder="Describe your funding requirements and how you plan to use the investment..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}