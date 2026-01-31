import React, { useState, useEffect } from 'react';
import { authService, listingService, integrationService } from '@/services/api';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import {
  Building2, Leaf, Cpu, Plus, X, Upload, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, Shield, FileText
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/Components/Landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Basic Info", description: "Tell us about your opportunity" },
  { id: 2, title: "Details", description: "Financial and business details" },
  { id: 3, title: "Media", description: "Add images and documents" },
  { id: 4, title: "Verification", description: "Government registrations" },
];

const categories = [
  { value: "technology", label: "Technology", icon: Cpu },
  { value: "agriculture", label: "Agriculture", icon: Leaf },
  { value: "hospitality", label: "Hospitality", icon: Building2 },
  { value: "real_estate", label: "Real Estate", icon: Building2 },
  { value: "healthcare", label: "Healthcare", icon: Building2 },
  { value: "education", label: "Education", icon: Building2 },
  { value: "manufacturing", label: "Manufacturing", icon: Building2 },
  { value: "energy", label: "Energy", icon: Building2 },
  { value: "finance", label: "Finance", icon: Building2 },
  { value: "retail", label: "Retail", icon: Building2 },
  { value: "other", label: "Other", icon: Building2 },
];

const types = [
  { value: "business", label: "Existing Business" },
  { value: "startup", label: "Startup" },
  { value: "real_estate", label: "Real Estate Property" },
  { value: "project", label: "Project/Development" },
];

const districts = [
  "Kigali", "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma",
  "Nyagatare", "Rwamagana", "Gasabo", "Kicukiro", "Nyarugenge",
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
  "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe",
  "Nyanza", "Nyaruguru", "Ruhango", "Karongi", "Ngororero",
  "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"
];

export default function ListOpportunity() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    category: '',
    description: '',
    short_description: '',
    asking_price: '',
    minimum_investment: '',
    location: '',
    district: '',
    projected_roi: '',
    year_established: '',
    employees: '',
    annual_revenue: '',
    highlights: [''],
    images: [],
    documents: [],
    rdb_registration_number: '',
    rra_tin: '',
    land_title_number: '',
  });
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    authService.getCurrentUser().then((currentUser) => {
      // Redirect investors to dashboard - only entrepreneurs/sellers can create listings
      if (currentUser?.role === 'investor') {
        toast.error('Only entrepreneurs can create listings. Please browse the marketplace instead.');
        navigate(createPageUrl("Dashboard"));
        return;
      }
      setUser(currentUser);
    }).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, [navigate]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Note: Backend automatically sets status='pending_review' and seller_id=current_user
      return await listingService.create(data);
    },
    onSuccess: () => {
      toast.success('Listing submitted for review! Our team will review it shortly.');
      setTimeout(() => {
        window.location.href = createPageUrl("Dashboard");
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to submit listing');
    }
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    for (const file of files) {
      const { url } = await integrationService.uploadFile(file);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    }
    setUploading(false);
  };

  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { url } = await integrationService.uploadFile(file);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { name: file.name, url: url, type: docType }]
    }));
    setUploading(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const updateHighlight = (index, value) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      asking_price: parseFloat(formData.asking_price) || 0,
      minimum_investment: parseFloat(formData.minimum_investment) || 0,
      projected_roi: parseFloat(formData.projected_roi) || 0,
      year_established: parseInt(formData.year_established) || null,
      employees: parseInt(formData.employees) || null,
      annual_revenue: parseFloat(formData.annual_revenue) || null,
      highlights: formData.highlights.filter(h => h.trim()),
    };
    createMutation.mutate(submitData);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.type && formData.category && formData.description;
      case 2:
        return formData.asking_price && formData.location && formData.district;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              List Your Investment Opportunity
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Connect with global investors and get government-verified status for your business
            </p>
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
              {STEPS.map((s, idx) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step > s.id
                    ? 'bg-emerald-500 text-white'
                    : step === s.id
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}>
                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Steps */}
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
                      <div>
                        <Label htmlFor="title">Opportunity Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Premium Coffee Export Business"
                          value={formData.title}
                          onChange={(e) => updateField('title', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Investment Type *</Label>
                          <Select value={formData.type} onValueChange={(v) => updateField('type', v)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {types.map(type => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Category *</Label>
                          <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="short_description">Short Description</Label>
                        <Input
                          id="short_description"
                          placeholder="Brief summary for listing cards (max 150 characters)"
                          value={formData.short_description}
                          onChange={(e) => updateField('short_description', e.target.value)}
                          maxLength={150}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Full Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your investment opportunity in detail..."
                          value={formData.description}
                          onChange={(e) => updateField('description', e.target.value)}
                          rows={6}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="asking_price">Asking Price (USD) *</Label>
                          <Input
                            id="asking_price"
                            type="number"
                            placeholder="500000"
                            value={formData.asking_price}
                            onChange={(e) => updateField('asking_price', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="minimum_investment">Minimum Investment (USD)</Label>
                          <Input
                            id="minimum_investment"
                            type="number"
                            placeholder="50000"
                            value={formData.minimum_investment}
                            onChange={(e) => updateField('minimum_investment', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            placeholder="e.g., Kigali Innovation City"
                            value={formData.location}
                            onChange={(e) => updateField('location', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>District *</Label>
                          <Select value={formData.district} onValueChange={(v) => updateField('district', v)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                            <SelectContent>
                              {districts.map(district => (
                                <SelectItem key={district} value={district}>{district}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="projected_roi">Projected ROI (%)</Label>
                          <Input
                            id="projected_roi"
                            type="number"
                            placeholder="15"
                            value={formData.projected_roi}
                            onChange={(e) => updateField('projected_roi', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="year_established">Year Established</Label>
                          <Input
                            id="year_established"
                            type="number"
                            placeholder="2018"
                            value={formData.year_established}
                            onChange={(e) => updateField('year_established', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="employees">Employees</Label>
                          <Input
                            id="employees"
                            type="number"
                            placeholder="25"
                            value={formData.employees}
                            onChange={(e) => updateField('employees', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="annual_revenue">Annual Revenue (USD)</Label>
                        <Input
                          id="annual_revenue"
                          type="number"
                          placeholder="250000"
                          value={formData.annual_revenue}
                          onChange={(e) => updateField('annual_revenue', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Key Highlights</Label>
                        <div className="mt-2 space-y-2">
                          {formData.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Input
                                placeholder="e.g., 5 years profitable track record"
                                value={highlight}
                                onChange={(e) => updateHighlight(idx, e.target.value)}
                              />
                              {formData.highlights.length > 1 && (
                                <Button variant="ghost" size="icon" onClick={() => removeHighlight(idx)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={addHighlight}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Highlight
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div>
                        <Label>Property Images</Label>
                        <p className="text-sm text-slate-500 mb-3">Upload high-quality images of your property or business</p>

                        <div className="grid grid-cols-3 gap-4">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeImage(idx)}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          <label className="aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                            {uploading ? (
                              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-500">Upload</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label>Supporting Documents</Label>
                        <p className="text-sm text-slate-500 mb-3">Upload business plans, financial statements, etc.</p>

                        <div className="space-y-3">
                          {formData.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <FileText className="w-5 h-5 text-slate-400" />
                              <span className="flex-1 text-sm">{doc.name}</span>
                              <span className="text-xs text-slate-500">{doc.type}</span>
                            </div>
                          ))}

                          <div className="grid grid-cols-2 gap-3">
                            <label className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 cursor-pointer text-center transition-colors">
                              <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                              <span className="text-sm text-slate-600">Business Plan</span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => handleDocumentUpload(e, 'Business Plan')}
                                className="hidden"
                              />
                            </label>
                            <label className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 cursor-pointer text-center transition-colors">
                              <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                              <span className="text-sm text-slate-600">Financial Statements</span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                onChange={(e) => handleDocumentUpload(e, 'Financial Statements')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 4 && (
                    <>
                      <div className="bg-emerald-50 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                          <Shield className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-emerald-900 mb-2">Government Verification</h3>
                            <p className="text-sm text-emerald-700">
                              Providing official registration numbers helps verify your listing and builds trust with investors.
                              Our team will verify these with the relevant government bodies.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="rdb_registration_number">RDB Registration Number</Label>
                        <Input
                          id="rdb_registration_number"
                          placeholder="Enter your Rwanda Development Board registration"
                          value={formData.rdb_registration_number}
                          onChange={(e) => updateField('rdb_registration_number', e.target.value)}
                          className="mt-2"
                        />
                        <p className="text-xs text-slate-500 mt-1">Optional - helps speed up verification</p>
                      </div>

                      <div>
                        <Label htmlFor="rra_tin">RRA Tax Identification Number (TIN)</Label>
                        <Input
                          id="rra_tin"
                          placeholder="Enter your Rwanda Revenue Authority TIN"
                          value={formData.rra_tin}
                          onChange={(e) => updateField('rra_tin', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {(formData.type === 'real_estate' || formData.category === 'real_estate') && (
                        <div>
                          <Label htmlFor="land_title_number">Land Title Number</Label>
                          <Input
                            id="land_title_number"
                            placeholder="Enter the official land title reference"
                            value={formData.land_title_number}
                            onChange={(e) => updateField('land_title_number', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      )}
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
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Submit for Review
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}