import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";
import BusinessProfile from "~/components/business/business-profile";
import { ComponentErrorBoundary } from "~/components/error-boundary";
import type { Route } from "./+types/demo.business";

export function meta() {
  return [
    { title: "Desert Oasis HVAC - Phoenix, AZ | AZ Business Services" },
    { name: "description", content: "Professional HVAC services in Phoenix, Arizona. AC repair, installation, and maintenance with 24/7 emergency service." },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Mock data for demonstration
  const sampleBusiness = {
    _id: "sample-business-id",
    name: "Desert Oasis HVAC",
    slug: "hvac-services-phoenix-desert-oasis-hvac",
    urlPath: "/hvac-services/phoenix/desert-oasis-hvac",
    logo: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop&crop=center",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop&crop=center",
    description: "Desert Oasis HVAC has been serving the Phoenix metropolitan area for over 15 years with professional heating, ventilation, and air conditioning services. Our certified technicians provide 24/7 emergency service, routine maintenance, and energy-efficient system installations. We pride ourselves on honest pricing, quality workmanship, and exceptional customer service.",
    shortDescription: "Professional HVAC services in Phoenix with 24/7 emergency service and certified technicians.",
    phone: "(602) 555-0123",
    email: "info@desertoasishvac.com",
    website: "https://desertoasishvac.com",
    address: "1234 E Camelback Rd, Suite 567",
    city: "Phoenix",
    state: "AZ",
    zip: "85016",
    coordinates: { lat: 33.5094, lng: -112.0740 },
    category: { 
      name: "HVAC Services", 
      icon: "❄️", 
      slug: "hvac-services" 
    },
    services: [
      "AC Installation & Replacement",
      "Heating System Repair",
      "Duct Cleaning & Sealing",
      "Preventive Maintenance",
      "Emergency 24/7 Service",
      "Energy Audits",
      "Smart Thermostat Installation",
      "Indoor Air Quality Solutions"
    ],
    hours: {
      monday: "7:00 AM - 6:00 PM",
      tuesday: "7:00 AM - 6:00 PM",
      wednesday: "7:00 AM - 6:00 PM",
      thursday: "7:00 AM - 6:00 PM",
      friday: "7:00 AM - 6:00 PM",
      saturday: "8:00 AM - 4:00 PM",
      sunday: "Emergency Only"
    },
    planTier: "pro" as const,
    featured: true,
    priority: 10,
    ownerId: undefined,
    claimed: false,
    verified: true,
    active: true,
    socialLinks: {
      facebook: "https://facebook.com/desertoasishvac",
      instagram: "https://instagram.com/desertoasishvac",
      twitter: "https://twitter.com/desertoasishvac",
      linkedin: "https://linkedin.com/company/desertoasishvac"
    },
    rating: 4.8,
    reviewCount: 247,
    createdAt: Date.now() - 86400000 * 365, // 1 year ago
    updatedAt: Date.now() - 86400000 * 7, // 1 week ago
  };

  const sampleRelatedBusinesses = [
    {
      _id: "related-1",
      name: "Phoenix Plumbing Pros",
      slug: "plumbing-phoenix-phoenix-plumbing-pros",
      shortDescription: "Licensed plumbers serving Phoenix with 24/7 emergency service",
      phone: "(602) 555-0456",
      rating: 4.6,
      reviewCount: 189,
      planTier: "pro",
      category: { name: "Plumbing Services", icon: "🔧", slug: "plumbing-services" },
      address: "5678 N 7th Ave",
      city: "Phoenix",
      state: "AZ",
      zip: "85013",
      verified: true,
      featured: false,
      services: ["Leak Repair", "Drain Cleaning", "Water Heater Installation"]
    },
    {
      _id: "related-2", 
      name: "Sunny Solar Solutions",
      slug: "solar-installation-phoenix-sunny-solar-solutions",
      shortDescription: "Solar panel installation and maintenance specialists",
      phone: "(602) 555-0789",
      rating: 4.9,
      reviewCount: 156,
      planTier: "power",
      category: { name: "Solar Services", icon: "☀️", slug: "solar-services" },
      address: "9012 E Indian School Rd",
      city: "Phoenix", 
      state: "AZ",
      zip: "85018",
      verified: true,
      featured: true,
      services: ["Solar Installation", "Battery Storage", "System Maintenance"]
    },
    {
      _id: "related-3",
      name: "Elite Electrical Services",
      slug: "electrical-phoenix-elite-electrical-services", 
      shortDescription: "Certified electricians for residential and commercial projects",
      phone: "(602) 555-0321",
      rating: 4.7,
      reviewCount: 203,
      planTier: "free",
      category: { name: "Electrical Services", icon: "⚡", slug: "electrical-services" },
      address: "3456 W Thomas Rd",
      city: "Phoenix",
      state: "AZ", 
      zip: "85017",
      verified: false,
      featured: false,
      services: ["Electrical Repair", "Panel Upgrades", "Lighting Installation"]
    }
  ];

  const sampleReviews = [
    {
      _id: "review-1",
      businessId: "sample-business-id",
      customerName: "Sarah Johnson",
      rating: 5,
      title: "Excellent Service!",
      content: "Desert Oasis HVAC came out on a Sunday for an emergency AC repair. The technician was professional, explained everything clearly, and had my system running in no time. Highly recommended!",
      date: "2024-06-15",
      verified: true,
      helpful: 12
    },
    {
      _id: "review-2",
      businessId: "sample-business-id", 
      customerName: "Mike Rodriguez",
      rating: 4,
      title: "Great Installation",
      content: "Had a new AC unit installed. The team was on time, clean, and did quality work. The price was fair and they explained the maintenance schedule. Only minor issue was they ran a bit late on the second day.",
      date: "2024-05-22",
      verified: true,
      helpful: 8
    },
    {
      _id: "review-3",
      businessId: "sample-business-id",
      customerName: "Linda Chen", 
      rating: 5,
      title: "Trustworthy Company",
      content: "I've been using Desert Oasis for maintenance for 3 years now. They're always honest about what needs to be done and never try to oversell. Fair pricing and reliable service.",
      date: "2024-05-10",
      verified: true,
      helpful: 15
    }
  ];

  return {
    isSignedIn: false,
    hasActiveSubscription: false,
    business: sampleBusiness,
    relatedBusinesses: sampleRelatedBusinesses,
    reviews: sampleReviews,
    isOwner: false,
  };
}

export default function DemoBusinessPage({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header loaderData={loaderData} />
      <ComponentErrorBoundary componentName="Business Profile">
        <BusinessProfile 
          business={loaderData.business}
          relatedBusinesses={loaderData.relatedBusinesses}
          reviews={loaderData.reviews}
          isOwner={loaderData.isOwner}
        />
      </ComponentErrorBoundary>
      <Footer />
    </>
  );
}