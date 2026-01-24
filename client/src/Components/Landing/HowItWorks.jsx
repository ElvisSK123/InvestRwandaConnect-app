import React from 'react';
import { motion } from "framer-motion";
import { Search, UserCheck, FileSignature, Wallet, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover Opportunities",
    description: "Browse verified businesses, startups, and real estate across Rwanda's growing sectors.",
    color: "emerald"
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Complete Verification",
    description: "Quick KYC process with identity verification and source of funds documentation.",
    color: "teal"
  },
  {
    number: "03",
    icon: FileSignature,
    title: "Due Diligence",
    description: "Access verified documents, financial records, and government registration status.",
    color: "cyan"
  },
  {
    number: "04",
    icon: Wallet,
    title: "Secure Escrow",
    description: "Funds held safely in regulated escrow until all conditions are met.",
    color: "amber"
  },
  {
    number: "05",
    icon: CheckCircle2,
    title: "Complete Transfer",
    description: "Automated government approvals, notarization, and ownership transfer.",
    color: "emerald"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Invest Without Leaving Home
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Our end-to-end digital process eliminates the need for travel while ensuring full legal compliance.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-amber-200 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-100 border border-slate-100 hover:border-emerald-200 hover:shadow-emerald-100/50 transition-all h-full">
                  <div className={`w-14 h-14 rounded-xl bg-${step.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <step.icon className={`w-7 h-7 text-${step.color}-600`} />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Step {step.number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {idx < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 w-6 h-6 text-slate-300 -translate-y-1/2 z-20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}