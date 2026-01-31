import React from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Building2, Leaf, Cpu, Hotel, Heart, GraduationCap, 
  Factory, Zap, Truck, ArrowUpRight 
} from "lucide-react";

const categories = [
  { 
    name: "Real Estate", 
    icon: Building2, 
    count: 124, 
    color: "emerald",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80"
  },
  { 
    name: "Agriculture", 
    icon: Leaf, 
    count: 89, 
    color: "green",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80"
  },
  { 
    name: "Technology", 
    icon: Cpu, 
    count: 156, 
    color: "blue",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80"
  },
  { 
    name: "Hospitality", 
    icon: Hotel, 
    count: 67, 
    color: "amber",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80"
  },
  { 
    name: "Healthcare", 
    icon: Heart, 
    count: 45, 
    color: "rose",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80"
  },
  { 
    name: "Education", 
    icon: GraduationCap, 
    count: 38, 
    color: "purple",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80"
  },
  { 
    name: "Manufacturing", 
    icon: Factory, 
    count: 52, 
    color: "slate",
    image: "https://images.unsplash.com/photo-1565465295423-68c959ca3c30?w=400&q=80"
  },
  { 
    name: "Energy", 
    icon: Zap, 
    count: 31, 
    color: "yellow",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80"
  },
];

export default function InvestmentCategories() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-4">
            Diverse Sectors
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Investment Categories
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore opportunities across Rwanda's fastest-growing industries.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, idx) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                to={createPageUrl("Marketplace") + `?category=${category.name.toLowerCase()}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-square">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                          <category.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-white/70">
                          {category.count} opportunities
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}