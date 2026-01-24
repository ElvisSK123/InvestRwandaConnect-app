import React from 'react';
import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Scale, Eye, UserCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: UserCheck,
    title: "Verified Users",
    description: "All investors and sellers undergo comprehensive KYC verification with identity and source of funds checks."
  },
  {
    icon: FileCheck,
    title: "Government Registration",
    description: "Every listing verified against RDB, RRA, and land registry databases for authenticity."
  },
  {
    icon: Lock,
    title: "Secure Escrow",
    description: "Funds held in regulated bank escrow accounts until all transaction conditions are met."
  },
  {
    icon: Scale,
    title: "Legal Compliance",
    description: "Integrated notary services and law firm partnerships ensure legally binding transactions."
  },
  {
    icon: Eye,
    title: "Transparent Process",
    description: "Real-time tracking of every step from initial inquiry to ownership transfer."
  },
  {
    icon: Shield,
    title: "Fraud Prevention",
    description: "Multi-layer verification, AI monitoring, and manual review for suspicious activities."
  }
];

export default function SecuritySection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-4">
            Trust & Security
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Your Investment is Protected
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Multiple layers of verification, compliance, and security ensure safe transactions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-6"
        >
          {["256-bit Encryption", "SOC 2 Compliant", "GDPR Ready", "PCI DSS"].map((badge) => (
            <div key={badge} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-300">{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}