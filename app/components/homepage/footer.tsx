import { Building2 } from "lucide-react";
import { Link } from "react-router";

const footerLinks = {
  services: {
    title: "Popular Services",
    links: [
      { name: "HVAC Services", href: "/category/hvac-services" },
      { name: "Plumbing", href: "/category/plumbing" },
      { name: "Electrical", href: "/category/electrical" },
      { name: "Landscaping", href: "/category/landscaping" },
      { name: "Home Security", href: "/category/home-security" },
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
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-desert-night border-t border-desert-night/20">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saguaro-teal text-cloud-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-sandstone">AZ Business Services</span>
            </Link>
            <p className="mt-4 text-sm text-clay-beige">
              Connecting Arizona residents with trusted local service providers.
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-sun-gold">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-clay-beige hover:text-sun-gold transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-clay-beige/20 pt-8">
          <p className="text-center text-sm text-clay-beige">
            © {new Date().getFullYear()} AZ Business Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}