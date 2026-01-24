import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">InvestRwanda</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-sm leading-relaxed">
              The trusted gateway for global investors to discover, verify, and invest in Rwanda's most promising opportunities.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Marketplace", page: "Marketplace" },
                { name: "List Opportunity", page: "ListOpportunity" },
                { name: "How It Works", page: "Home" },
                { name: "About Us", page: "About" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={createPageUrl(link.page)} className="hover:text-emerald-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Investment Types */}
          <div>
            <h4 className="text-white font-semibold mb-4">Invest In</h4>
            <ul className="space-y-3">
              {["Businesses", "Startups", "Real Estate", "Projects", "Agriculture", "Technology"].map((type) => (
                <li key={type}>
                  <Link to={createPageUrl("Marketplace")} className="hover:text-emerald-400 transition-colors">
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Kigali, Rwanda</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>invest@investrwanda.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>+250 788 000 000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Partners */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-sm text-center text-slate-500 mb-4">Officially Aligned With</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            {["Rwanda Development Board", "RURA", "Rwanda Revenue Authority", "National Bank of Rwanda"].map((partner) => (
              <span key={partner} className="text-sm">{partner}</span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} InvestRwanda. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">AML Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}