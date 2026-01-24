import React from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Slider } from "@/Components/ui/slider";
import { Checkbox } from "@/Components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/Components/ui/select";
import { X, Filter, RotateCcw } from "lucide-react";

const categories = [
  { value: "technology", label: "Technology" },
  { value: "agriculture", label: "Agriculture" },
  { value: "hospitality", label: "Hospitality" },
  { value: "real_estate", label: "Real Estate" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "energy", label: "Energy" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
];

const types = [
  { value: "business", label: "Business" },
  { value: "startup", label: "Startup" },
  { value: "real_estate", label: "Real Estate" },
  { value: "project", label: "Project" },
];

const districts = [
  "Kigali", "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", 
  "Nyagatare", "Rwamagana", "Musanze", "Rubavu", "Rusizi", "Huye"
];

const verificationLevels = [
  { value: "rdb_verified", label: "RDB Verified" },
  { value: "fully_verified", label: "Fully Verified" },
];

export default function FilterSidebar({ filters, setFilters, onClose, isMobile = false }) {
  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      type: "",
      district: "",
      priceRange: [0, 10000000],
      verificationOnly: false,
      sortBy: "newest"
    });
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`bg-white ${isMobile ? 'p-6' : 'p-6 rounded-2xl border border-slate-100'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-500 text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Category */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Category</Label>
          <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Investment Type</Label>
          <Select value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Location</Label>
          <Select value={filters.district} onValueChange={(v) => updateFilter('district', v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {districts.map(district => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-4 block">
            Investment Range
          </Label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(v) => updateFilter('priceRange', v)}
              max={10000000}
              step={50000}
              className="mb-3"
            />
            <div className="flex justify-between text-sm text-slate-500">
              <span>${(filters.priceRange?.[0] || 0).toLocaleString()}</span>
              <span>${(filters.priceRange?.[1] || 10000000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Verification Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="verified" 
            checked={filters.verificationOnly}
            onCheckedChange={(v) => updateFilter('verificationOnly', v)}
          />
          <label
            htmlFor="verified"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Verified listings only
          </label>
        </div>

        {/* Sort */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Newest First" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="roi">Highest ROI</SelectItem>
              <SelectItem value="popular">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}