import { Building2 } from "lucide-react";
import { Link } from "react-router";

const footerLinks = {
  services: {
    title: "Popular Services",
    links: [
      { name: "HVAC Services", href: "/hvac-services" },
      { name: "Plumbing", href: "/plumbing" },
      { name: "Electrical", href: "/electrical" },
      { name: "Landscaping", href: "/landscaping" },
      { name: "Home Security", href: "/home-security" },
    ],
  },
  cities: {
    title: "Popular Cities",
    links: [
      { name: "Phoenix", href: "/city/phoenix" },
      { name: "Tucson", href: "/city/tucson" },
      { name: "Mesa", href: "/city/mesa" },
      { name: "Scottsdale", href: "/city/scottsdale" },
      { name: "Chandler", href: "/city/chandler" },
    ],
  },
  business: {
    title: "For Businesses",
    links: [
      { name: "Add Your Business", href: "/add-business" },
      { name: "Pricing Plans", href: "/pricing" },
      { name: "Success Stories", href: "/blog" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="relative bg-ironwood-charcoal border-t border-ironwood-charcoal/20">
      {/* Arizona Desert Horizon Divider */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 64"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Desert Sky Gradient Background */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A3C6D2" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FDF8F3" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect width="1200" height="64" fill="url(#skyGradient)" />
          
          {/* Mountain Range Silhouette */}
          <path
            d="M0 48 L150 20 L300 35 L450 15 L600 30 L750 18 L900 25 L1050 12 L1200 22 L1200 64 L0 64 Z"
            fill="#DAB6AA"
            opacity="0.3"
          />
          <path
            d="M0 52 L200 28 L400 38 L600 25 L800 32 L1000 20 L1200 28 L1200 64 L0 64 Z"
            fill="#799C8D"
            opacity="0.2"
          />
          
          {/* Scattered Cacti Silhouettes */}
          <g opacity="0.15" fill="#2B2A28">
            <path d="M100 45 L100 55 M95 50 L105 50" strokeWidth="2" stroke="#2B2A28" />
            <circle cx="100" cy="45" r="3" />
            
            <path d="M300 48 L300 58 M295 52 L305 52" strokeWidth="2" stroke="#2B2A28" />
            <circle cx="300" cy="48" r="2.5" />
            
            <path d="M500 46 L500 56 M495 51 L505 51" strokeWidth="2" stroke="#2B2A28" />
            <circle cx="500" cy="46" r="3" />
            
            <path d="M700 49 L700 59 M695 53 L705 53" strokeWidth="2" stroke="#2B2A28" />
            <circle cx="700" cy="49" r="2" />
            
            <path d="M900 47 L900 57 M895 52 L905 52" strokeWidth="2" stroke="#2B2A28" />
            <circle cx="900" cy="47" r="2.5" />
            
            <path d="M1100 50 L1100 60 M1095 55 L1105 55" strokeWidth="2" stroke="#2B2A28" />
            <circle cx="1100" cy="50" r="2" />
          </g>
        </svg>
      </div>
      
      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 mt-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocotillo-red text-agave-cream">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-agave-cream">AZ Business Services</span>
            </Link>
            <p className="mt-4 text-sm text-prickly-pear-pink">
              Connecting Arizona residents with trusted local service providers.
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-desert-sky-blue">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-prickly-pear-pink hover:text-desert-sky-blue transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-prickly-pear-pink/20 pt-8">
          <p className="text-center text-sm text-prickly-pear-pink">
            © {new Date().getFullYear()} AZ Business Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}