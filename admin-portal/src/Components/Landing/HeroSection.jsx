import React from 'react';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ArrowRight, Shield, Globe, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-100/50 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-emerald-100/30 rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-2 text-sm font-medium">
              <Shield className="w-4 h-4 mr-2" />
              Government-Verified Investment Platform
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Invest in
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Rwanda's Future
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
              The trusted gateway for global investors. Buy businesses, real estate, and fund startups—fully online with government-backed verification and secure escrow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to={createPageUrl("Marketplace")}>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6 rounded-xl shadow-lg shadow-emerald-200">
                  Explore Opportunities
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("ListOpportunity")}>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2">
                  List Your Business
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-slate-200">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm text-slate-500">Trusted by</p>
                <p className="font-semibold text-slate-900">2,500+ Global Investors</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80" 
                alt="Kigali Skyline"
                className="rounded-3xl shadow-2xl shadow-slate-200/50"
              />
              
              {/* Floating Cards */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -left-8 top-1/4 bg-white rounded-2xl shadow-xl p-5 max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-slate-900">RDB Verified</span>
                </div>
                <p className="text-sm text-slate-500">All listings verified by Rwanda Development Board</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-8 bottom-1/4 bg-white rounded-2xl shadow-xl p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-slate-500">Active Investors</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">47 Countries</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-6 left-1/4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-xl p-5 text-white"
              >
                <p className="text-sm opacity-90 mb-1">Total Invested</p>
                <p className="text-3xl font-bold">$127M+</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}