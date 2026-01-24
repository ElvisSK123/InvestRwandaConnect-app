import React, { useState, useEffect } from 'react';
import { listingService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
import { Search, SlidersHorizontal, Grid3X3, List, Loader2 } from "lucide-react";
import ListingCard from "@/Components/Marketplace/ListingCard";
import FilterSidebar from "@/Components/Marketplace/FilterSidebar";
import Footer from "@/Components/Landing/Footer";
import { motion } from "framer-motion";

export default function Marketplace() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    type: "",
    district: "",
    priceRange: [0, 10000000],
    verificationOnly: false,
    sortBy: "newest"
  });
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse URL params for initial filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, category: category.toLowerCase() }));
    }
  }, []);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => listingService.getAll({ status: 'approved', sort: '-created_date', limit: 100 }),
  });

  // Filter and sort listings
  const filteredListings = listings.filter(listing => {
    if (filters.search && !listing.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category && filters.category !== 'all' && listing.category !== filters.category) return false;
    if (filters.type && filters.type !== 'all' && listing.type !== filters.type) return false;
    if (filters.district && filters.district !== 'all' && listing.district !== filters.district) return false;
    if (filters.priceRange) {
      const price = listing.asking_price || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
    }
    if (filters.verificationOnly && !['rdb_verified', 'fully_verified'].includes(listing.verification_status)) return false;
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_low': return (a.asking_price || 0) - (b.asking_price || 0);
      case 'price_high': return (b.asking_price || 0) - (a.asking_price || 0);
      case 'roi': return (b.projected_roi || 0) - (a.projected_roi || 0);
      case 'popular': return (b.views_count || 0) - (a.views_count || 0);
      default: return new Date(b.created_date) - new Date(a.created_date);
    }
  });

  const activeFilterCount = [
    filters.category && filters.category !== 'all',
    filters.type && filters.type !== 'all',
    filters.district && filters.district !== 'all',
    filters.verificationOnly,
    filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 10000000
  ].filter(Boolean).length;

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
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Investment Marketplace
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Discover verified opportunities across Rwanda's fastest-growing sectors
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search businesses, startups, real estate..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-12 pr-4 py-6 text-lg rounded-xl border-0 shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-6">
              <FilterSidebar filters={filters} setFilters={setFilters} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-slate-600">
                  <span className="font-semibold text-slate-900">{filteredListings.length}</span> opportunities found
                </span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    {activeFilterCount} filters active
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-2 bg-emerald-500 text-white">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <FilterSidebar
                      filters={filters}
                      setFilters={setFilters}
                      onClose={() => setMobileFiltersOpen(false)}
                      isMobile
                    />
                  </SheetContent>
                </Sheet>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No listings found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or search terms</p>
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    search: "",
                    category: "",
                    type: "",
                    district: "",
                    priceRange: [0, 10000000],
                    verificationOnly: false,
                    sortBy: "newest"
                  })}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredListings.map((listing, index) => (
                  <ListingCard key={listing.id} listing={listing} index={index} />
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