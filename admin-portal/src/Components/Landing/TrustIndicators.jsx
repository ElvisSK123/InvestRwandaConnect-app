import React from 'react';
import { motion } from "framer-motion";
import { Shield, FileCheck, Landmark, Scale, CreditCard, Users } from "lucide-react";

const partners = [
  { name: "RDB", fullName: "Rwanda Development Board", icon: Landmark },
  { name: "RURA", fullName: "Rwanda Utilities Regulatory Authority", icon: Scale },
  { name: "RRA", fullName: "Rwanda Revenue Authority", icon: FileCheck },
  { name: "BNR", fullName: "National Bank of Rwanda", icon: CreditCard },
];

const stats = [
  { value: "$127M+", label: "Total Investments", icon: CreditCard },
  { value: "850+", label: "Verified Listings", icon: FileCheck },
  { value: "2,500+", label: "Global Investors", icon: Users },
  { value: "99.8%", label: "Transaction Success", icon: Shield },
];

export default function TrustIndicators() {
  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="container mx-auto px-6">
        {/* Government Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-8">
            Officially Aligned With Rwanda's Trusted Institutions
          </p>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            {partners.map((partner, idx) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
                  <partner.icon className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="font-bold text-slate-900">{partner.name}</p>
                <p className="text-xs text-slate-500 max-w-[120px] text-center">{partner.fullName}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-6 text-center group hover:border-emerald-200 transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
              <stat.icon className="w-6 h-6 text-emerald-600 mx-auto mb-3" />
              <p className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}