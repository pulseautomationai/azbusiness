"use client";
import { UserButton, useUser } from "@clerk/react-router";
import { Building2, Menu, X, Plus } from "lucide-react";
import React, { useCallback } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const menuItems = [
  { name: "Home", href: "/" },
  { name: "Browse by Category", href: "/categories" },
  { name: "Browse by City", href: "/cities" },
  { name: "Blog", href: "/blog" },
  { name: "Pricing", href: "/pricing" },
];

export const Header = () => {
  const { isSignedIn } = useUser();
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setMenuState(false);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-99 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-7xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/80 max-w-6xl rounded-2xl border backdrop-blur-lg lg:px-8"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                to="/"
                aria-label="home"
                className="flex items-center space-x-3 font-bold text-xl"
                prefetch="viewport"
              >
                <img 
                  src="/azbusiness1.png" 
                  alt="AZ Business Services"
                  className="h-10 w-10 rounded-lg object-cover"
                  onError={(e) => {
                    // Fallback to a simple icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Building2 className="h-10 w-10 text-primary hidden" />
                <span className="hidden sm:inline">AZ Business Services</span>
                <span className="sm:hidden">AZ Business</span>
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
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className="text-muted-foreground hover:text-saguaro-teal block duration-150 transition-colors"
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
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className="text-muted-foreground hover:text-saguaro-teal block duration-150 transition-colors w-full text-left"
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
                    <Button asChild size="sm" variant="outline">
                      <Link to="/dashboard" prefetch="viewport">
                        <span>My Listings</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm">
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
                        <span>Login</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
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