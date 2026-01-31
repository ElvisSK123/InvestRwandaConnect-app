import React, { useState, useEffect } from 'react';
import { authService, listingService, inquiryService, messageService, favoriteService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Textarea } from "@/Components/ui/textarea";
import { Input } from "@/Components/ui/input";
import {
  MapPin, TrendingUp, Calendar, Users, Building2, Shield,
  FileText, ChevronLeft, ChevronRight, Share2, Heart,
  CheckCircle2, Clock, Eye, Mail, Phone, Loader2,
  Landmark, FileCheck, DollarSign, ArrowRight, MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/Components/Landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const verificationBadges = {
  unverified: { label: "Pending Verification", color: "bg-slate-100 text-slate-600", icon: Clock },
  documents_submitted: { label: "Under Review", color: "bg-amber-100 text-amber-700", icon: Clock },
  rdb_verified: { label: "RDB Verified", color: "bg-emerald-100 text-emerald-700", icon: Shield },
  fully_verified: { label: "Fully Verified", color: "bg-emerald-500 text-white", icon: CheckCircle2 },
};

export default function ListingDetails() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [user, setUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');

  const queryClient = useQueryClient();

  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(() => { });
  }, []);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => favoriteService.getAll({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const isFavorited = favorites.some(f => f.listing_id === listingId);
  const favoriteRecord = favorites.find(f => f.listing_id === listingId);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited && favoriteRecord) {
        await favoriteService.delete(favoriteRecord.id);
      } else {
        await favoriteService.create({
          user_id: user.id,
          listing_id: listingId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  const handleFavoriteClick = () => {
    if (!user) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      // Backend automatically increments view count
      return await listingService.getById(listingId);
    },
    enabled: !!listingId
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data) => {
      return await inquiryService.create(data);
    },
    onSuccess: () => {
      setInquiryOpen(false);
      setInquiryMessage('');
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      return await messageService.create({
        listing_id: listingId,
        sender_id: user?.id,
        sender_name: user?.full_name,
        recipient_id: listing?.seller_id,
        recipient_name: listing?.created_by,
        message: message,
        listing_title: listing?.title,
        read: false
      });
    },
    onSuccess: () => {
      setInquiryOpen(false);
      setInquiryMessage('');
      window.location.href = createPageUrl("Messages");
    }
  });

  const handleInquiry = () => {
    if (!inquiryMessage.trim()) return;

    inquiryMutation.mutate({
      listing_id: listingId,
      investor_id: user?.id,
      seller_id: listing?.seller_id,
      subject: `Inquiry about: ${listing?.title}`,
      message: inquiryMessage
    });
  };

  const handleSendMessage = () => {
    if (!inquiryMessage.trim()) return;
    sendMessageMutation.mutate(inquiryMessage);
  };

  if (isLoading) {
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

  const images = listing.images?.length > 0 ? listing.images : [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
  ];

  const verification = verificationBadges[listing.verification_status] || verificationBadges.unverified;
  const VerificationIcon = verification.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to={createPageUrl("Marketplace")} className="hover:text-emerald-600">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-slate-900">{listing.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
              <div className="relative aspect-video">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className={verification.color}>
                    <VerificationIcon className="w-3 h-3 mr-1" />
                    {verification.label}
                  </Badge>
                  {listing.featured && (
                    <Badge className="bg-amber-500 text-white border-0">Featured</Badge>
                  )}
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={handleFavoriteClick}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                    <Share2 className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${idx === currentImageIndex ? 'border-emerald-500' : 'border-transparent'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Tabs */}
            <Card>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  {['overview', 'details', 'documents', 'verification'].map(tab => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent capitalize px-6 py-3"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Opportunity</h2>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>

                  {listing.highlights?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-slate-900 mb-4">Key Highlights</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {listing.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="details" className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {listing.year_established && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Established</p>
                        <p className="font-semibold text-slate-900">{listing.year_established}</p>
                      </div>
                    )}
                    {listing.employees && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Employees</p>
                        <p className="font-semibold text-slate-900">{listing.employees}</p>
                      </div>
                    )}
                    {listing.annual_revenue && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Annual Revenue</p>
                        <p className="font-semibold text-slate-900">${listing.annual_revenue.toLocaleString()}</p>
                      </div>
                    )}
                    {listing.minimum_investment && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Minimum Investment</p>
                        <p className="font-semibold text-slate-900">${listing.minimum_investment.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Category</p>
                      <p className="font-semibold text-slate-900 capitalize">{listing.category?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Type</p>
                      <p className="font-semibold text-slate-900 capitalize">{listing.type?.replace('_', ' ')}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="p-6">
                  {listing.documents?.length > 0 ? (
                    <div className="space-y-3">
                      {listing.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
                        >
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{doc.name}</p>
                            <p className="text-sm text-slate-500">{doc.type}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      Documents will be available after verification
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="verification" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${listing.rdb_registration_number ? 'bg-emerald-100' : 'bg-slate-200'
                        }`}>
                        <Landmark className={`w-6 h-6 ${listing.rdb_registration_number ? 'text-emerald-600' : 'text-slate-400'
                          }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">RDB Registration</p>
                        <p className="text-sm text-slate-500">
                          {listing.rdb_registration_number || 'Pending verification'}
                        </p>
                      </div>
                      {listing.rdb_registration_number && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${listing.rra_tin ? 'bg-emerald-100' : 'bg-slate-200'
                        }`}>
                        <FileCheck className={`w-6 h-6 ${listing.rra_tin ? 'text-emerald-600' : 'text-slate-400'
                          }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">RRA Tax Registration</p>
                        <p className="text-sm text-slate-500">
                          {listing.rra_tin || 'Pending verification'}
                        </p>
                      </div>
                      {listing.rra_tin && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                      )}
                    </div>

                    {listing.type === 'real_estate' && (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${listing.land_title_number ? 'bg-emerald-100' : 'bg-slate-200'
                          }`}>
                          <Building2 className={`w-6 h-6 ${listing.land_title_number ? 'text-emerald-600' : 'text-slate-400'
                            }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Land Title</p>
                          <p className="text-sm text-slate-500">
                            {listing.land_title_number || 'Pending verification'}
                          </p>
                        </div>
                        {listing.land_title_number && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Card */}
            <Card className="sticky top-6">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500 capitalize">
                    {listing.category?.replace('_', ' ')} • {listing.type}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Eye className="w-4 h-4" />
                    {listing.views_count || 0} views
                  </div>
                </div>
                <CardTitle className="text-2xl">{listing.title}</CardTitle>
                <div className="flex items-center gap-2 text-slate-600 mt-2">
                  <MapPin className="w-4 h-4" />
                  {listing.location}, {listing.district}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Investment Amount</p>
                    <p className="text-3xl font-bold text-slate-900">
                      ${listing.asking_price?.toLocaleString()}
                    </p>
                  </div>
                  {listing.projected_roi && (
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Projected ROI</p>
                      <div className="flex items-center gap-1 text-emerald-600 text-xl font-bold">
                        <TrendingUp className="w-5 h-5" />
                        {listing.projected_roi}%
                      </div>
                    </div>
                  )}
                </div>

                {listing.minimum_investment && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Minimum Investment</p>
                    <p className="text-lg font-semibold text-slate-900">
                      ${listing.minimum_investment.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Link to={createPageUrl("StartInvestment") + `?listing=${listingId}`}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Start Investment
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full py-6 text-lg"
                    onClick={handleFavoriteClick}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
                  </Button>

                  <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full py-6 text-lg">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Message Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Message Seller</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Textarea
                          placeholder="Write your message to the seller..."
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          rows={5}
                        />
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleInquiry}
                            disabled={inquiryMutation.isPending || !inquiryMessage.trim()}
                          >
                            {inquiryMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Mail className="w-4 h-4 mr-2" />
                            )}
                            Send Inquiry
                          </Button>
                          <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleSendMessage}
                            disabled={sendMessageMutation.isPending || !inquiryMessage.trim()}
                          >
                            {sendMessageMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <MessageSquare className="w-4 h-4 mr-2" />
                            )}
                            Start Chat
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 text-center">
                    🔒 Your inquiry is secure and will only be shared with verified sellers
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span>Secure escrow protection</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}