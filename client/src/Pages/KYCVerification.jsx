import React, { useState, useEffect } from 'react';
import { authService, kycService, integrationService } from '@/services/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import {
  Shield, CheckCircle2, Upload, Loader2, User, FileText,
  Camera, AlertCircle, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/Components/Landing/Footer";
import { motion } from "framer-motion";

const statusInfo = {
  not_started: { color: 'bg-slate-100', text: 'Not Started', icon: Clock },
  documents_submitted: { color: 'bg-amber-100 text-amber-700', text: 'Under Review', icon: Clock },
  additional_info_required: { color: 'bg-orange-100 text-orange-700', text: 'Additional Info Required', icon: AlertCircle },
  verified: { color: 'bg-emerald-100 text-emerald-700', text: 'Verified', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-700', text: 'Rejected', icon: AlertCircle },
};

export default function KYCVerification() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({
    verification_type: 'individual',
    full_legal_name: '',
    nationality: '',
    country_of_residence: '',
    id_type: '',
    id_number: '',
    id_document_url: '',
    id_expiry_date: '',
    selfie_url: '',
    proof_of_address_url: '',
    source_of_funds: '',
    source_of_funds_details: '',
    // Company fields
    company_name: '',
    company_registration_number: '',
    company_registration_document_url: '',
    company_country: '',
  });

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u);
      setFormData(prev => ({
        ...prev,
        full_legal_name: u.full_name || '',
        country_of_residence: u.country || '',
      }));
    }).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, []);

  const { data: existingKyc, isLoading } = useQuery({
    queryKey: ['kyc', user?.id],
    queryFn: async () => {
      const kycs = await kycService.getAll({ user_id: user?.id });
      return kycs[0] || null;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (existingKyc) {
      setFormData({
        verification_type: existingKyc.verification_type || 'individual',
        full_legal_name: existingKyc.full_legal_name || '',
        nationality: existingKyc.nationality || '',
        country_of_residence: existingKyc.country_of_residence || '',
        id_type: existingKyc.id_type || '',
        id_number: existingKyc.id_number || '',
        id_document_url: existingKyc.id_document_url || '',
        id_expiry_date: existingKyc.id_expiry_date || '',
        selfie_url: existingKyc.selfie_url || '',
        proof_of_address_url: existingKyc.proof_of_address_url || '',
        source_of_funds: existingKyc.source_of_funds || '',
        source_of_funds_details: existingKyc.source_of_funds_details || '',
        company_name: existingKyc.company_name || '',
        company_registration_number: existingKyc.company_registration_number || '',
        company_registration_document_url: existingKyc.company_registration_document_url || '',
        company_country: existingKyc.company_country || '',
      });
    }
  }, [existingKyc]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingKyc) {
        return await kycService.update(existingKyc.id, {
          ...data,
          status: 'documents_submitted'
        });
      }
      return await kycService.create({
        ...data,
        user_id: user?.id,
        status: 'documents_submitted',
      });
    },
    onSuccess: () => {
      window.location.reload();
    }
  });

  const handleFileUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    const { file_url } = await integrationService.uploadFile(file);
    setFormData(prev => ({ ...prev, [field]: file_url }));
    setUploading(prev => ({ ...prev, [field]: false }));
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    saveMutation.mutate(formData);
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const status = existingKyc?.status || 'not_started';
  const StatusIcon = statusInfo[status]?.icon || Clock;

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
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Identity Verification
            </h1>
            <p className="text-emerald-100">
              Complete your KYC to unlock full investment capabilities
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Status Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${statusInfo[status]?.color || 'bg-slate-100'} flex items-center justify-center`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Verification Status</p>
                    <p className={`text-sm ${statusInfo[status]?.color?.includes('text') ? statusInfo[status].color : 'text-slate-500'}`}>
                      {statusInfo[status]?.text}
                    </p>
                  </div>
                </div>
                {status === 'verified' && (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                )}
              </div>

              {existingKyc?.reviewer_notes && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note from reviewer:</strong> {existingKyc.reviewer_notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Form */}
          {status !== 'verified' && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Information</CardTitle>
                <CardDescription>
                  Please provide accurate information as it will be verified against official documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Verification Type */}
                <div>
                  <Label>Verification Type</Label>
                  <Select value={formData.verification_type} onValueChange={(v) => updateField('verification_type', v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Investor</SelectItem>
                      <SelectItem value="company">Company/Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.verification_type === 'individual' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Legal Name *</Label>
                        <Input
                          value={formData.full_legal_name}
                          onChange={(e) => updateField('full_legal_name', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Nationality *</Label>
                        <Input
                          placeholder="e.g., United States"
                          value={formData.nationality}
                          onChange={(e) => updateField('nationality', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Country of Residence</Label>
                      <Input
                        value={formData.country_of_residence}
                        onChange={(e) => updateField('country_of_residence', e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>ID Type *</Label>
                        <Select value={formData.id_type} onValueChange={(v) => updateField('id_type', v)}>
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
                          value={formData.id_number}
                          onChange={(e) => updateField('id_number', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>ID Expiry Date</Label>
                      <Input
                        type="date"
                        value={formData.id_expiry_date}
                        onChange={(e) => updateField('id_expiry_date', e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    {/* Document Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="mb-2 block">ID Document *</Label>
                        <div className="relative">
                          {formData.id_document_url ? (
                            <div className="aspect-video rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                          ) : (
                            <label className="aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                              {uploading.id_document_url ? (
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                              ) : (
                                <>
                                  <FileText className="w-6 h-6 text-slate-400 mb-2" />
                                  <span className="text-xs text-slate-500">Upload ID</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload('id_document_url', e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Selfie with ID *</Label>
                        <div className="relative">
                          {formData.selfie_url ? (
                            <div className="aspect-video rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                          ) : (
                            <label className="aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                              {uploading.selfie_url ? (
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                              ) : (
                                <>
                                  <Camera className="w-6 h-6 text-slate-400 mb-2" />
                                  <span className="text-xs text-slate-500">Upload Selfie</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload('selfie_url', e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Proof of Address</Label>
                        <div className="relative">
                          {formData.proof_of_address_url ? (
                            <div className="aspect-video rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                          ) : (
                            <label className="aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                              {uploading.proof_of_address_url ? (
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                              ) : (
                                <>
                                  <FileText className="w-6 h-6 text-slate-400 mb-2" />
                                  <span className="text-xs text-slate-500">Upload Proof</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload('proof_of_address_url', e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Company Name *</Label>
                        <Input
                          value={formData.company_name}
                          onChange={(e) => updateField('company_name', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Registration Number *</Label>
                        <Input
                          value={formData.company_registration_number}
                          onChange={(e) => updateField('company_registration_number', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Country of Registration</Label>
                      <Input
                        value={formData.company_country}
                        onChange={(e) => updateField('company_country', e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Company Registration Document *</Label>
                      <label className="p-6 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                        {uploading.company_registration_document_url ? (
                          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        ) : formData.company_registration_document_url ? (
                          <>
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                            <span className="text-sm text-emerald-600">Document Uploaded</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">Upload Registration Certificate</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload('company_registration_document_url', e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                )}

                {/* Source of Funds */}
                <div>
                  <Label>Source of Funds *</Label>
                  <Select value={formData.source_of_funds} onValueChange={(v) => updateField('source_of_funds', v)}>
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

                {formData.source_of_funds === 'other' && (
                  <div>
                    <Label>Please specify source of funds</Label>
                    <Input
                      value={formData.source_of_funds_details}
                      onChange={(e) => updateField('source_of_funds_details', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSubmit}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Submit for Verification
                </Button>
              </CardContent>
            </Card>
          )}

          {status === 'verified' && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Complete</h2>
                <p className="text-slate-600 mb-8">
                  Your identity has been verified. You can now make investments and access all platform features.
                </p>
                <Link to={createPageUrl("Marketplace")}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Explore Opportunities
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}