import React, { useState, useEffect } from 'react';
import { authService, favoriteService, listingService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Heart, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import ListingCard from "@/Components/Marketplace/ListingCard";
import Footer from "@/Components/Landing/Footer";
import { motion } from "framer-motion";

export default function MyFavorites() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .catch(() => window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`);
  }, []);

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => favoriteService.getAll({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => listingService.getAll({ status: 'approved' }),
  });

  const favoriteListingIds = favorites.map(f => f.listing_id);
  const favoriteListings = listings.filter(listing => favoriteListingIds.includes(listing.id));

  const isLoading = favoritesLoading || listingsLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        <div className="container mx-auto px-6">
          <Link to={createPageUrl("Marketplace")}>
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-12 h-12 text-white fill-white" />
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                My Favorites
              </h1>
            </div>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Your saved investment opportunities
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : favoriteListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Heart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No favorites yet</h3>
            <p className="text-slate-500 mb-6">Start exploring opportunities and save your favorites for quick access</p>
            <Link to={createPageUrl("Marketplace")}>
              <Button>
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-slate-600">
                <span className="font-semibold text-slate-900">{favoriteListings.length}</span> saved {favoriteListings.length === 1 ? 'opportunity' : 'opportunities'}
              </span>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {favoriteListings.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}