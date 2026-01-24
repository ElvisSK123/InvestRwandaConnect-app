import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { authService, messageService } from '@/services/api';
import { Button } from "@/Components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
import {
  Globe, Menu, X, User, LayoutDashboard, Shield,
  LogOut, Building2, TrendingUp, ChevronDown, MessageSquare, Heart, Target
} from "lucide-react";

const navLinks = [
  { name: "Marketplace", page: "Marketplace", icon: TrendingUp, roles: ['investor', 'entrepreneur', null] },
  { name: "My Goals", page: "InvestmentGoals", icon: Target, roles: ['investor'] },
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard, roles: ['entrepreneur'] },
  { name: "List Opportunity", page: "ListOpportunity", icon: Building2, roles: ['entrepreneur'] },
  { name: "My Favorites", page: "MyFavorites", icon: Heart, roles: ['investor', 'entrepreneur'] },
  { name: "Admin Portal", page: "AdminPortal", icon: Shield, roles: ['admin'] },
  { name: "Analytics", page: "AdminDashboard", icon: TrendingUp, roles: ['admin'] },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(() => { });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`;
  };

  const handleLogout = () => {
    authService.logout();
  };

  // Pages that should have transparent header
  const transparentHeaderPages = ['Home'];
  const isTransparentHeader = transparentHeaderPages.includes(currentPageName) && !isScrolled;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparentHeader
        ? 'bg-transparent'
        : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
        }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isTransparentHeader
                ? 'bg-white/20 backdrop-blur-sm'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                <Globe className={`w-5 h-5 ${isTransparentHeader ? 'text-white' : 'text-white'}`} />
              </div>
              <span className={`text-xl font-bold ${isTransparentHeader ? 'text-white' : 'text-slate-900'}`}>
                InvestRwanda
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks
                .filter(link => !link.roles || !user || link.roles.includes(user.role))
                .map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className={`text-sm font-medium transition-colors relative ${currentPageName === link.page
                      ? isTransparentHeader ? 'text-white' : 'text-emerald-600'
                      : isTransparentHeader ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`flex items-center gap-2 ${isTransparentHeader ? 'text-white hover:bg-white/10' : ''
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden sm:inline">{user.full_name?.split(' ')[0] || 'Account'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium text-slate-900">{user.full_name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <Link to={createPageUrl("Dashboard")}>
                      <DropdownMenuItem>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link to={createPageUrl("KYCVerification")}>
                      <DropdownMenuItem>
                        <Shield className="w-4 h-4 mr-2" />
                        KYC Verification
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleLogin}
                    className={isTransparentHeader ? 'text-white hover:bg-white/10' : ''}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={handleLogin}
                    className={isTransparentHeader
                      ? 'bg-white text-emerald-700 hover:bg-white/90'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                    }
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`lg:hidden ${isTransparentHeader ? 'text-white hover:bg-white/10' : ''}`}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-900">InvestRwanda</span>
                      </div>
                    </div>

                    <nav className="flex-1 space-y-2">
                      {navLinks
                        .filter(link => !link.roles || !user || link.roles.includes(user.role))
                        .map((link) => (
                          <Link
                            key={link.page}
                            to={createPageUrl(link.page)}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentPageName === link.page
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-slate-600 hover:bg-slate-50'
                              }`}
                          >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                          </Link>
                        ))}

                      {user && (
                        <>
                          <div className="border-t border-slate-100 my-4" />
                          <Link
                            to={createPageUrl("Dashboard")}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                          </Link>

                          <Link
                            to={createPageUrl("KYCVerification")}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
                          >
                            <Shield className="w-5 h-5" />
                            KYC Verification
                          </Link>
                        </>
                      )}
                    </nav>

                    <div className="pt-4 border-t border-slate-100">
                      {user ? (
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                          onClick={handleLogin}
                        >
                          Sign In / Register
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className={transparentHeaderPages.includes(currentPageName) ? '' : 'pt-16 lg:pt-20'}>
        {children}
      </main>
    </div>
  );
}