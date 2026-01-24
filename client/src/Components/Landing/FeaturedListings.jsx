import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ArrowRight, MapPin, TrendingUp, Building2, Leaf, Cpu, Hotel } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryIcons = {
  technology: Cpu,
  agriculture: Leaf,
  hospitality: Hotel,
  real_estate: Building2,
};

const featuredListings = [
  {
    id: 1,
    title: "Tech Hub Coworking Space",
    type: "business",
    category: "technology",
    location: "Kigali Innovation City",
    price: 450000,
    roi: 18,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    verified: true,
    featured: true
  },
  {
    id: 2,
    title: "Premium Coffee Estate",
    type: "business",
    category: "agriculture",
    location: "Nyamasheke District",
    price: 890000,
    roi: 22,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
    verified: true,
    featured: true
  },
  {
    id: 3,
    title: "Lakeside Boutique Hotel",
    type: "real_estate",
    category: "hospitality",
    location: "Lake Kivu, Rubavu",
    price: 1250000,
    roi: 15,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    verified: true,
    featured: true
  }
];

export default function FeaturedListings() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-12"
        >
          <div>
            <span className="inline-block px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-4">
              Featured Opportunities
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Curated Investments
            </h2>
            <p className="text-xl text-slate-600 max-w-xl">
              Hand-picked opportunities verified by our team and government partners.
            </p>
          </div>
          <Link to={createPageUrl("Marketplace")} className="mt-6 lg:mt-0">
            <Button variant="outline" size="lg" className="rounded-xl">
              View All Listings
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredListings.map((listing, idx) => {
            const CategoryIcon = categoryIcons[listing.category] || Building2;
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={listing.image} 
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      {listing.verified && (
                        <Badge className="bg-emerald-500 text-white border-0">
                          ✓ RDB Verified
                        </Badge>
                      )}
                      {listing.featured && (
                        <Badge className="bg-amber-500 text-white border-0">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <MapPin className="w-4 h-4" />
                        {listing.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <CategoryIcon className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="text-sm text-slate-500 capitalize">
                        {listing.category.replace('_', ' ')} • {listing.type}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                      {listing.title}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-sm text-slate-500">Investment</p>
                        <p className="text-2xl font-bold text-slate-900">
                          ${listing.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Projected ROI</p>
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          <TrendingUp className="w-4 h-4" />
                          {listing.roi}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}