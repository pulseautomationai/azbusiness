"use client";
import { UserButton, useUser } from "@clerk/react-router";
import { Building2, Menu, X, Plus, List, ChevronDown } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const menuItems = [
  { name: "How It Works", href: "/about" },
  { name: "About", href: "/about" },
];

const browseItems = [
  { name: "Browse by Category", href: "/categories" },
  { name: "Browse by City", href: "/cities" },
];

export const Header = () => {
  const { isSignedIn } = useUser();
  const [menuState, setMenuState] = React.useState(false);
  const [browseDropdownOpen, setBrowseDropdownOpen] = useState(false);
  // Removed scroll effect - header stays consistent

  const handleNavClick = useCallback((href: string) => {
    setMenuState(false);
    setBrowseDropdownOpen(false);
  }, []);

  const handleBrowseToggle = useCallback(() => {
    setBrowseDropdownOpen(!browseDropdownOpen);
  }, [browseDropdownOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setBrowseDropdownOpen(false);
    }
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (browseDropdownOpen && !(event.target as Element).closest('.browse-dropdown')) {
        setBrowseDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [browseDropdownOpen]);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-99 w-full px-2"
      >
        <div
          className="mx-auto mt-2 max-w-7xl px-6 lg:px-12 bg-agave-cream/90 rounded-2xl border border-prickly-pear-pink/30 backdrop-blur-lg"
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-0.5 lg:gap-0 lg:py-1">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                to="/"
                aria-label="home"
                className="flex items-center space-x-1 font-bold text-xl"
                prefetch="viewport"
              >
                <img 
                  src="/logo.png?v=2024" 
                  alt="AZ Business Services"
                  className="h-20 w-20 rounded-lg object-cover hover:scale-105 transition-transform duration-300 animate-pulse-slow"
                  onError={(e) => {
                    // Fallback to a simple icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Building2 className="h-20 w-20 text-primary hidden" />
                <span className="hidden sm:inline">Az Business Services</span>
                <span className="sm:hidden">Az Business</span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {/* Browse Dropdown */}
                <li className="relative browse-dropdown">
                  <button
                    onClick={handleBrowseToggle}
                    onKeyDown={handleKeyDown}
                    className="text-ironwood-charcoal hover:text-desert-sky-blue duration-150 transition-colors flex items-center gap-1"
                    aria-expanded={browseDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>Browse</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      browseDropdownOpen && "rotate-180"
                    )} />
                  </button>
                  {browseDropdownOpen && (
                    <ul className="absolute top-full left-0 mt-2 w-48 bg-white border border-prickly-pear-pink/20 rounded-lg shadow-lg py-2 z-50">
                      {browseItems.map((item, index) => (
                        <li key={index}>
                          <Link
                            to={item.href}
                            onClick={() => handleNavClick(item.href)}
                            className="block px-4 py-2 text-sm text-ironwood-charcoal hover:bg-agave-cream hover:text-desert-sky-blue transition-colors"
                            prefetch="viewport"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
                
                {/* For Business Owners */}
                <li>
                  <Link
                    to="/for-businesses"
                    onClick={() => handleNavClick("/for-businesses")}
                    className="block duration-150 transition-colors"
                    prefetch="viewport"
                  >
                    <span className="bg-prickly-pear-pink text-ironwood-charcoal px-4 py-2 rounded-lg text-sm font-medium hover:bg-prickly-pear-pink/80 transition-colors inline-block">
                      For Business Owners
                    </span>
                  </Link>
                </li>
                
                {/* Existing menu items */}
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className="text-ironwood-charcoal hover:text-desert-sky-blue block duration-150 transition-colors"
                      prefetch="viewport"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {/* Browse Section - Mobile */}
                  <li>
                    <div className="text-ironwood-charcoal font-medium mb-3">Browse</div>
                    <ul className="space-y-3 ml-4">
                      {browseItems.map((item, index) => (
                        <li key={index}>
                          <Link
                            to={item.href}
                            onClick={() => handleNavClick(item.href)}
                            className="text-ironwood-charcoal/80 hover:text-desert-sky-blue block duration-150 transition-colors w-full text-left"
                            prefetch="viewport"
                          >
                            <span>{item.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  
                  {/* For Business Owners */}
                  <li>
                    <Link
                      to="/for-businesses"
                      onClick={() => handleNavClick("/for-businesses")}
                      className="text-ironwood-charcoal hover:text-desert-sky-blue block duration-150 transition-colors w-full text-left"
                      prefetch="viewport"
                    >
                      <span>For Business Owners</span>
                    </Link>
                  </li>
                  
                  {/* Existing menu items */}
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className="text-ironwood-charcoal hover:text-desert-sky-blue block duration-150 transition-colors w-full text-left"
                        prefetch="viewport"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {isSignedIn ? (
                  <div className="flex items-center gap-3">
                    <Button asChild size="sm" variant="outline" className="border-ironwood-charcoal/20 hover:bg-agave-cream/50 hover:border-ironwood-charcoal/40">
                      <Link to="/dashboard" prefetch="viewport">
                        <List className="mr-1.5 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90">
                      <Link to="/add-business" prefetch="viewport">
                        <Plus className="mr-1 h-4 w-4" />
                        <span>Add Business</span>
                      </Link>
                    </Button>
                    <UserButton />
                  </div>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link to="/sign-in" prefetch="viewport">
                        <span>Sign In</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="bg-ocotillo-red text-white hover:bg-ocotillo-red/90"
                    >
                      <Link to="/add-business" prefetch="viewport">
                        <Plus className="mr-1 h-4 w-4" />
                        <span>Add Your Business</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};