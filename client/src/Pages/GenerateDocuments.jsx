import React, { useState, useEffect } from 'react';
import { authService, listingService, investmentService, documentService, integrationService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
  FileText, Download, Loader2, CheckCircle2, Clock,
  Shield, AlertCircle, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Footer from "@/Components/Landing/Footer";

const documentTypes = [
  {
    type: 'investment_agreement',
    label: 'Investment Agreement',
    description: 'Comprehensive agreement outlining terms and conditions',
    icon: FileText
  },
  {
    type: 'nda',
    label: 'Non-Disclosure Agreement',
    description: 'Protect confidential information during due diligence',
    icon: Shield
  },
  {
    type: 'term_sheet',
    label: 'Term Sheet',
    description: 'Summary of key investment terms and conditions',
    icon: FileText
  },
  {
    type: 'escrow_agreement',
    label: 'Escrow Agreement',
    description: 'Agreement for secure fund holding during transaction',
    icon: Shield
  },
];

export default function GenerateDocuments() {
  const [user, setUser] = useState(null);
  const [generating, setGenerating] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const investmentId = urlParams.get('investment');

  const queryClient = useQueryClient();

  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(() => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    });
  }, []);

  const { data: investment } = useQuery({
    queryKey: ['investment', investmentId],
    queryFn: async () => {
      const investments = await investmentService.getAll({ id: investmentId });
      return investments[0] || null;
    },
    enabled: !!investmentId
  });

  const { data: listing } = useQuery({
    queryKey: ['listing', investment?.listing_id],
    queryFn: async () => {
      const listings = await listingService.getAll({ id: investment?.listing_id });
      return listings[0] || null;
    },
    enabled: !!investment?.listing_id
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', investmentId],
    queryFn: () => documentService.getAll({ investment_id: investmentId }),
    enabled: !!investmentId
  });

  const generateMutation = useMutation({
    mutationFn: async (docType) => {
      setGenerating(docType);

      // Generate document content using AI
      const prompt = `Generate a professional ${docType.replace('_', ' ')} document for this investment transaction:

Investment Details:
- Investor: ${user?.full_name}
- Seller: ${listing?.created_by || 'Seller Name'}
- Property: ${listing?.title}
- Investment Amount: $${investment?.amount?.toLocaleString()}
- Location: ${listing?.location}, Rwanda
- Date: ${format(new Date(), 'MMMM d, yyyy')}

Generate a complete, legally-structured document with all necessary clauses, terms, and conditions appropriate for Rwanda's legal framework. Include sections for signatures and dates.`;

      const result = await integrationService.invokeLLM(prompt);

      // Create document record
      return await documentService.create({
        investment_id: investmentId,
        listing_id: investment?.listing_id,
        document_type: docType,
        document_url: `data:text/plain;base64,${btoa(result)}`,
        generated: true,
        status: 'draft',
        metadata: {
          investor_name: user?.full_name,
          seller_name: listing?.created_by,
          amount: investment?.amount,
          date: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setGenerating(null);
    },
    onError: () => {
      setGenerating(null);
    }
  });

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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Document Generation</h1>
                <p className="text-blue-100">AI-powered legal document creation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {investment && listing && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <img
                  src={listing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80"}
                  alt=""
                  className="w-20 h-14 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="font-semibold text-slate-900">{listing.title}</h2>
                  <p className="text-sm text-slate-500">{listing.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Investment Amount</p>
                  <p className="text-2xl font-bold text-slate-900">${investment.amount?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Generate New Documents */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Generate Documents</h2>

            {documentTypes.map((doc) => {
              const Icon = doc.icon;
              const existing = documents.find(d => d.document_type === doc.type);

              return (
                <Card key={doc.type}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{doc.label}</h3>
                        <p className="text-sm text-slate-500 mb-3">{doc.description}</p>

                        {existing ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Generated
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {format(new Date(existing.created_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => generateMutation.mutate(doc.type)}
                            disabled={generating === doc.type || !investmentId}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {generating === doc.type ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate with AI
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Generated Documents */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Your Documents</h2>

            {documents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">No documents yet</h3>
                  <p className="text-slate-500">Generate your first document to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-900 capitalize mb-1">
                            {doc.document_type.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {format(new Date(doc.created_date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={
                          doc.status === 'signed' ? 'bg-emerald-100 text-emerald-700' :
                            doc.status === 'pending_signature' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                        }>
                          {doc.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          {doc.signed_by_investor ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-slate-600">Investor</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {doc.signed_by_seller ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-slate-600">Seller</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = doc.document_url;
                          link.download = `${doc.document_type}.txt`;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Document
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}