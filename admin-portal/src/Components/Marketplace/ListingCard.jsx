import React, { useState, useEffect } from 'react';
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { MapPin, TrendingUp, Eye, Building2, Leaf, Cpu, Hotel, Heart, GraduationCap, Factory, Zap, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { authService, favoriteService } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const categoryIcons = {
  technology: Cpu,
  agriculture: Leaf,
  hospitality: Hotel,
  real_estate: Building2,
  healthcare: Heart,
  education: GraduationCap,
  manufacturing: Factory,
  energy: Zap,
  retail: ShoppingBag,
  other: Building2,
};

const verificationBadges = {
  unverified: { label: "Pending", color: "bg-slate-100 text-slate-600" },
  documents_submitted: { label: "In Review", color: "bg-amber-100 text-amber-700" },
  rdb_verified: { label: "RDB Verified", color: "bg-emerald-100 text-emerald-700" },
  fully_verified: { label: "Fully Verified", color: "bg-emerald-500 text-white" },
};

export default function ListingCard({ listing, index = 0 }) {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const CategoryIcon = categoryIcons[listing.category] || Building2;
  const verification = verificationBadges[listing.verification_status] || verificationBadges.unverified;

  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(() => { });
  }, []);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => favoriteService.getAll({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const isFavorited = favorites.some(f => f.listing_id === listing.id);
  const favoriteRecord = favorites.find(f => f.listing_id === listing.id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited && favoriteRecord) {
        await favoriteService.delete(favoriteRecord.id);
      } else {
        await favoriteService.create({
          user_id: user.id,
          listing_id: listing.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl("ListingDetails") + `?id=${listing.id}`}>
        <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-100/50 hover:border-emerald-200 transition-all duration-300">
          <div className="relative h-48 overflow-hidden">
            <img
              src={listing.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80"}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <div className="flex gap-2">
                <Badge className={verification.color}>
                  {listing.verification_status === 'fully_verified' && '✓ '}
                  {verification.label}
                </Badge>
                {listing.featured && (
                  <Badge className="bg-amber-500 text-white border-0">
                    Featured
                  </Badge>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm"
                onClick={handleFavoriteClick}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
              </Button>
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white/90 text-sm">
              <MapPin className="w-4 h-4" />
              {listing.location || listing.district}
            </div>

            {listing.views_count > 0 && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/80 text-xs bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                <Eye className="w-3 h-3" />
                {listing.views_count}
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <CategoryIcon className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                {listing.category?.replace('_', ' ')} • {listing.type}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
              {listing.title}
            </h3>

            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
              {listing.short_description || listing.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Investment</p>
                <p className="text-xl font-bold text-slate-900">
                  ${listing.asking_price?.toLocaleString()}
                </p>
              </div>
              {listing.projected_roi && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">Projected ROI</p>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold">
                    <TrendingUp className="w-4 h-4" />
                    {listing.projected_roi}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}