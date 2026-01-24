import React, { useState, useEffect } from 'react';
import { authService, listingService, kycService, investmentService } from '@/services/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import {
  Shield, CheckCircle2, ArrowRight, ArrowLeft, Loader2,
  User, FileText, CreditCard, Building2, Lock, AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/Components/Landing/Footer";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, title: "Review", description: "Review investment details", icon: FileText },
  { id: 2, title: "KYC", description: "Identity verification", icon: User },
  { id: 3, title: "Payment", description: "Secure escrow deposit", icon: CreditCard },
  { id: 4, title: "Confirm", description: "Final confirmation", icon: CheckCircle2 },
];

export default function StartInvestment() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [kycData, setKycData] = useState({
    full_legal_name: '',
    nationality: '',
    country_of_residence: '',
    id_type: '',
    id_number: '',
    source_of_funds: '',
    terms_accepted: false,
    risk_acknowledged: false,
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('listing');

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u);
      setKycData(prev => ({
        ...prev,
        full_legal_name: u.full_name || '',
        country_of_residence: u.country || '',
      }));
    }).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, []);

  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await listingService.getAll({ id: listingId });
      return listings[0] || null;
    },
    enabled: !!listingId
  });

  const { data: existingKyc } = useQuery({
    queryKey: ['kyc', user?.id],
    queryFn: async () => {
      const kycs = await kycService.getAll({ user_id: user?.id });
      return kycs[0] || null;
    },
    enabled: !!user?.id
  });

  const kycMutation = useMutation({
    mutationFn: async (data) => {
      if (existingKyc) {
        return await kycService.update(existingKyc.id, data);
      }
      return await kycService.create({
        ...data,
        user_id: user?.id,
        verification_type: 'individual',
        status: 'documents_submitted',
      });
    },
  });

  const investmentMutation = useMutation({
    mutationFn: async () => {
      return await investmentService.create({
        listing_id: listingId,
        investor_id: user?.id,
        seller_id: listing?.seller_id,
        amount: parseFloat(investmentAmount) || listing?.asking_price,
        status: 'initiated',
        escrow_status: 'not_started',
        payment_method: paymentMethod,
        rdb_approval_status: 'pending',
        legal_review_status: 'pending',
        timeline: [{
          date: new Date().toISOString(),
          event: 'Investment Initiated',
          details: 'Investor submitted investment request'
        }]
      });
    },
    onSuccess: () => {
      window.location.href = createPageUrl("Dashboard");
    }
  });

  const updateKycField = (field, value) => {
    setKycData(prev => ({ ...prev, [field]: value }));
  };

  const handleKycSubmit = () => {
    kycMutation.mutate(kycData);
    setStep(3);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return investmentAmount && parseFloat(investmentAmount) >= (listing?.minimum_investment || 0);
      case 2:
        return kycData.full_legal_name && kycData.nationality && kycData.id_type &&
          kycData.id_number && kycData.source_of_funds;
      case 3:
        return paymentMethod;
      case 4:
        return kycData.terms_accepted && kycData.risk_acknowledged;
      default:
        return false;
    }
  };

  if (listingLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Listing Not Found</h1>
        <Link to={createPageUrl("Marketplace")}>
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Start Investment</h1>
              <p className="text-emerald-100">{listing.title}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-emerald-500 -z-10 transition-all"
                style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              />
              {STEPS.map((s) => {
                const StepIcon = s.icon;
                return (
                  <div key={s.id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step > s.id
                        ? 'bg-emerald-500 text-white'
                        : step === s.id
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}>
                      {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <p className={`mt-2 text-sm font-medium hidden sm:block ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                      {s.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{STEPS[step - 1].title}</CardTitle>
                      <CardDescription>{STEPS[step - 1].description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {step === 1 && (
                        <>
                          <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center gap-4 mb-4">
                              <img
                                src={listing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                                alt=""
                                className="w-20 h-14 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-semibold text-slate-900">{listing.title}</p>
                                <p className="text-sm text-slate-500">{listing.location}, {listing.district}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Asking Price</p>
                                <p className="font-semibold">${listing.asking_price?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Minimum Investment</p>
                                <p className="font-semibold">${listing.minimum_investment?.toLocaleString() || 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="amount">Your Investment Amount (USD) *</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder={listing.asking_price?.toString()}
                              value={investmentAmount}
                              onChange={(e) => setInvestmentAmount(e.target.value)}
                              className="mt-2"
                            />
                            {listing.minimum_investment && investmentAmount && parseFloat(investmentAmount) < listing.minimum_investment && (
                              <p className="text-sm text-red-500 mt-1">
                                Minimum investment is ${listing.minimum_investment.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                              <p className="font-medium mb-1">Identity Verification Required</p>
                              <p>To comply with anti-money laundering regulations, we need to verify your identity before processing this investment.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Full Legal Name *</Label>
                              <Input
                                value={kycData.full_legal_name}
                                onChange={(e) => updateKycField('full_legal_name', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Nationality *</Label>
                              <Input
                                placeholder="e.g., United States"
                                value={kycData.nationality}
                                onChange={(e) => updateKycField('nationality', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Country of Residence</Label>
                            <Input
                              value={kycData.country_of_residence}
                              onChange={(e) => updateKycField('country_of_residence', e.target.value)}
                              className="mt-2"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>ID Type *</Label>
                              <Select value={kycData.id_type} onValueChange={(v) => updateKycField('id_type', v)}>
                                <SelectTrigger className="mt-2">
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="passport">Passport</SelectItem>
                                  <SelectItem value="national_id">National ID</SelectItem>
                                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>ID Number *</Label>
                              <Input
                                value={kycData.id_number}
                                onChange={(e) => updateKycField('id_number', e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Source of Funds *</Label>
                            <Select value={kycData.source_of_funds} onValueChange={(v) => updateKycField('source_of_funds', v)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select source of funds" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employment">Employment Income</SelectItem>
                                <SelectItem value="business_income">Business Income</SelectItem>
                                <SelectItem value="investments">Investment Returns</SelectItem>
                                <SelectItem value="inheritance">Inheritance</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {step === 3 && (
                        <>
                          <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-emerald-800">
                              <p className="font-medium mb-1">Secure Escrow Protection</p>
                              <p>Your funds will be held in a regulated escrow account until all transaction conditions are met and verified.</p>
                            </div>
                          </div>

                          <div>
                            <Label>Payment Method *</Label>
                            <div className="grid grid-cols-1 gap-3 mt-3">
                              {[
                                { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct bank transfer (2-3 business days)' },
                                { value: 'international_wire', label: 'International Wire', desc: 'SWIFT transfer from any country' },
                                { value: 'mobile_money', label: 'Mobile Money (MTN/Airtel)', desc: 'For Rwanda-based investors' },
                              ].map((method) => (
                                <div
                                  key={method.value}
                                  onClick={() => setPaymentMethod(method.value)}
                                  className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === method.value
                                      ? 'border-emerald-500 bg-emerald-50'
                                      : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-slate-900">{method.label}</p>
                                      <p className="text-sm text-slate-500">{method.desc}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.value ? 'border-emerald-500' : 'border-slate-300'
                                      }`}>
                                      {paymentMethod === method.value && (
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-sm text-slate-600">
                              <strong>Note:</strong> After confirming, you'll receive detailed payment instructions via email.
                              Funds must be deposited within 5 business days to secure your investment.
                            </p>
                          </div>
                        </>
                      )}

                      {step === 4 && (
                        <>
                          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                            <h3 className="font-semibold text-slate-900">Investment Summary</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Opportunity</span>
                                <span className="font-medium">{listing.title}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Investment Amount</span>
                                <span className="font-medium">${parseFloat(investmentAmount || listing.asking_price).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Payment Method</span>
                                <span className="font-medium capitalize">{paymentMethod?.replace('_', ' ')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Platform Fee (2.5%)</span>
                                <span className="font-medium">${(parseFloat(investmentAmount || listing.asking_price) * 0.025).toLocaleString()}</span>
                              </div>
                              <div className="border-t pt-2 flex justify-between">
                                <span className="font-medium text-slate-900">Total</span>
                                <span className="font-bold text-emerald-600">
                                  ${(parseFloat(investmentAmount || listing.asking_price) * 1.025).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id="terms"
                                checked={kycData.terms_accepted}
                                onCheckedChange={(v) => updateKycField('terms_accepted', v)}
                              />
                              <label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
                                I agree to the Terms of Service, Privacy Policy, and Investment Agreement. I understand that my funds will be held in escrow until the transaction is complete.
                              </label>
                            </div>

                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id="risk"
                                checked={kycData.risk_acknowledged}
                                onCheckedChange={(v) => updateKycField('risk_acknowledged', v)}
                              />
                              <label htmlFor="risk" className="text-sm text-slate-600 leading-tight">
                                I acknowledge that investing involves risks and I may lose some or all of my investment. I have read and understood the risk disclosure.
                              </label>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(s => s - 1)}
                  disabled={step === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {step < 4 ? (
                  <Button
                    onClick={() => {
                      if (step === 2) {
                        handleKycSubmit();
                      } else {
                        setStep(s => s + 1);
                      }
                    }}
                    disabled={!canProceed()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => investmentMutation.mutate()}
                    disabled={!canProceed() || investmentMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {investmentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Confirm Investment
                  </Button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Investment Protection</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Shield, title: 'Secure Escrow', desc: 'Funds held safely until verified' },
                      { icon: FileText, title: 'Legal Review', desc: 'All documents verified by lawyers' },
                      { icon: Building2, title: 'Gov. Approval', desc: 'RDB verification for all deals' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-600">
                    <strong>Need help?</strong> Our investment team is available to guide you through the process.
                  </p>
                  <Button variant="outline" className="w-full mt-4">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}