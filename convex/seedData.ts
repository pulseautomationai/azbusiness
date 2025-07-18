// Seed data for AZ Business Services

export const categories = [
  { name: "HVAC Services", slug: "hvac-services", description: "Heating, ventilation, and air conditioning specialists", icon: "🌡️", order: 1 },
  { name: "Plumbing", slug: "plumbing", description: "Professional plumbing services for residential and commercial", icon: "🚿", order: 2 },
  { name: "Electrical", slug: "electrical", description: "Licensed electricians for all electrical needs", icon: "⚡", order: 3 },
  { name: "Cleaning Services", slug: "cleaning-services", description: "Residential and commercial cleaning professionals", icon: "🧹", order: 4 },
  { name: "Landscaping", slug: "landscaping", description: "Landscape design, maintenance, and lawn care", icon: "🌳", order: 5 },
  { name: "Handyman", slug: "handyman", description: "General repair and maintenance services", icon: "🔧", order: 6 },
  { name: "Pest Control", slug: "pest-control", description: "Pest elimination and prevention services", icon: "🐛", order: 7 },
  { name: "Home Security", slug: "home-security", description: "Security system installation and monitoring", icon: "🔒", order: 8 },
  { name: "Roofing & Gutters", slug: "roofing-gutters", description: "Roof repair, replacement, and gutter services", icon: "🏠", order: 9 },
  { name: "Flooring", slug: "flooring", description: "Flooring installation and refinishing services", icon: "🪵", order: 10 },
  { name: "Painting", slug: "painting", description: "Interior and exterior painting services", icon: "🎨", order: 11 },
  { name: "Pool & Spa Services", slug: "pool-spa-services", description: "Pool maintenance, repair, and spa services", icon: "🏊", order: 12 },
  { name: "Garage Door Services", slug: "garage-door-services", description: "Garage door repair and installation", icon: "🚪", order: 13 },
  { name: "Appliance Repair", slug: "appliance-repair", description: "Repair services for all major appliances", icon: "🔌", order: 14 },
  { name: "Locksmith Services", slug: "locksmith-services", description: "Emergency and scheduled lock services", icon: "🔑", order: 15 },
  { name: "Tree Services", slug: "tree-services", description: "Tree trimming, removal, and care", icon: "🌲", order: 16 },
  { name: "Junk Removal", slug: "junk-removal", description: "Hauling and disposal services", icon: "🚛", order: 17 },
  { name: "Moving Services", slug: "moving-services", description: "Local and long-distance moving services", icon: "📦", order: 18 },
  { name: "Solar Installation", slug: "solar-installation", description: "Solar panel installation and maintenance", icon: "☀️", order: 19 },
  { name: "Home Inspection", slug: "home-inspection", description: "Professional property inspections", icon: "🔍", order: 20 },
  { name: "Mobile Detailing", slug: "mobile-detailing", description: "On-site vehicle detailing services", icon: "🚗", order: 21 },
  { name: "Pressure Washing", slug: "pressure-washing", description: "Power washing for homes and businesses", icon: "💦", order: 22 },
  { name: "Concrete Services", slug: "concrete-services", description: "Concrete pouring, repair, and finishing", icon: "🧱", order: 23 },
  { name: "Fencing", slug: "fencing", description: "Fence installation and repair", icon: "🚧", order: 24 },
  { name: "Deck & Patio Services", slug: "deck-patio-services", description: "Deck building and patio construction", icon: "🪜", order: 25 },
  { name: "Chimney Services", slug: "chimney-services", description: "Chimney cleaning and repair", icon: "🏭", order: 26 },
  { name: "Septic & Sewer Services", slug: "septic-sewer-services", description: "Septic system and sewer services", icon: "🚽", order: 27 },
  { name: "Foundation Repair", slug: "foundation-repair", description: "Foundation inspection and repair", icon: "🏗️", order: 28 },
  { name: "Mobile Mechanics", slug: "mobile-mechanics", description: "On-site vehicle repair services", icon: "🔧", order: 29 },
  { name: "Mobile Tire Services", slug: "mobile-tire-services", description: "On-site tire repair and replacement", icon: "🛞", order: 30 },
  { name: "Mobile Pet Grooming", slug: "mobile-pet-grooming", description: "Pet grooming at your location", icon: "🐕", order: 31 },
  { name: "Window Tinting", slug: "window-tinting", description: "Automotive and residential tinting", icon: "🪟", order: 32 },
  { name: "Gutter Guards", slug: "gutter-guards", description: "Gutter protection installation", icon: "🍃", order: 33 },
  { name: "Outdoor Lighting", slug: "outdoor-lighting", description: "Landscape and security lighting", icon: "💡", order: 34 },
  { name: "Fire & Water Damage Restoration", slug: "fire-water-damage-restoration", description: "Emergency restoration services", icon: "🔥", order: 35 },
  { name: "Mold Remediation", slug: "mold-remediation", description: "Mold removal and prevention", icon: "🦠", order: 36 },
  { name: "Insulation Services", slug: "insulation-services", description: "Home insulation installation", icon: "🏚️", order: 37 },
  { name: "Smart Home Installation", slug: "smart-home-installation", description: "Smart device setup and integration", icon: "📱", order: 38 },
];

export const cities = [
  // Phoenix Metro Area
  { name: "Phoenix", slug: "phoenix", region: "Phoenix Metro Area", order: 1, population: 1680992 },
  { name: "Scottsdale", slug: "scottsdale", region: "Phoenix Metro Area", order: 2, population: 258069 },
  { name: "Mesa", slug: "mesa", region: "Phoenix Metro Area", order: 3, population: 518012 },
  { name: "Tempe", slug: "tempe", region: "Phoenix Metro Area", order: 4, population: 195805 },
  { name: "Glendale", slug: "glendale", region: "Phoenix Metro Area", order: 5, population: 252381 },
  { name: "Chandler", slug: "chandler", region: "Phoenix Metro Area", order: 6, population: 261165 },
  { name: "Peoria", slug: "peoria", region: "Phoenix Metro Area", order: 7, population: 175961 },
  { name: "Gilbert", slug: "gilbert", region: "Phoenix Metro Area", order: 8, population: 254114 },
  { name: "Surprise", slug: "surprise", region: "Phoenix Metro Area", order: 9, population: 141664 },
  { name: "Avondale", slug: "avondale", region: "Phoenix Metro Area", order: 10, population: 89334 },
  { name: "Goodyear", slug: "goodyear", region: "Phoenix Metro Area", order: 11, population: 95294 },
  { name: "Buckeye", slug: "buckeye", region: "Phoenix Metro Area", order: 12, population: 91502 },
  { name: "Paradise Valley", slug: "paradise-valley", region: "Phoenix Metro Area", order: 13, population: 13332 },
  { name: "Fountain Hills", slug: "fountain-hills", region: "Phoenix Metro Area", order: 14, population: 23820 },
  { name: "Carefree", slug: "carefree", region: "Phoenix Metro Area", order: 15, population: 3690 },
  { name: "Cave Creek", slug: "cave-creek", region: "Phoenix Metro Area", order: 16, population: 4951 },
  { name: "Queen Creek", slug: "queen-creek", region: "Phoenix Metro Area", order: 17, population: 59519 },
  
  // Tucson Metro Area
  { name: "Tucson", slug: "tucson", region: "Tucson Metro Area", order: 20, population: 548073 },
  { name: "Oro Valley", slug: "oro-valley", region: "Tucson Metro Area", order: 21, population: 47070 },
  { name: "Marana", slug: "marana", region: "Tucson Metro Area", order: 22, population: 51908 },
  { name: "Sahuarita", slug: "sahuarita", region: "Tucson Metro Area", order: 23, population: 34134 },
  { name: "South Tucson", slug: "south-tucson", region: "Tucson Metro Area", order: 24, population: 5701 },
  { name: "Catalina Foothills", slug: "catalina-foothills", region: "Tucson Metro Area", order: 25, population: 50796 },
  
  // Northern Arizona
  { name: "Flagstaff", slug: "flagstaff", region: "Northern Arizona", order: 30, population: 75038 },
  { name: "Sedona", slug: "sedona", region: "Northern Arizona", order: 31, population: 9684 },
  { name: "Prescott", slug: "prescott", region: "Northern Arizona", order: 32, population: 45827 },
  { name: "Prescott Valley", slug: "prescott-valley", region: "Northern Arizona", order: 33, population: 46515 },
  { name: "Cottonwood", slug: "cottonwood", region: "Northern Arizona", order: 34, population: 12612 },
  { name: "Camp Verde", slug: "camp-verde", region: "Northern Arizona", order: 35, population: 12147 },
  { name: "Payson", slug: "payson", region: "Northern Arizona", order: 36, population: 16351 },
  { name: "Show Low", slug: "show-low", region: "Northern Arizona", order: 37, population: 12409 },
  { name: "Winslow", slug: "winslow", region: "Northern Arizona", order: 38, population: 8897 },
  
  // Western Arizona
  { name: "Yuma", slug: "yuma", region: "Western Arizona", order: 40, population: 95548 },
  { name: "Lake Havasu City", slug: "lake-havasu-city", region: "Western Arizona", order: 41, population: 57144 },
  { name: "Bullhead City", slug: "bullhead-city", region: "Western Arizona", order: 42, population: 41348 },
  { name: "Kingman", slug: "kingman", region: "Western Arizona", order: 43, population: 32689 },
  { name: "Parker", slug: "parker", region: "Western Arizona", order: 44, population: 3172 },
  
  // Eastern Arizona
  { name: "Casa Grande", slug: "casa-grande", region: "Eastern Arizona", order: 50, population: 57232 },
  { name: "Eloy", slug: "eloy", region: "Eastern Arizona", order: 51, population: 15635 },
  { name: "Florence", slug: "florence", region: "Eastern Arizona", order: 52, population: 26785 },
  { name: "Apache Junction", slug: "apache-junction", region: "Eastern Arizona", order: 53, population: 41863 },
  { name: "Globe", slug: "globe", region: "Eastern Arizona", order: 54, population: 7249 },
  { name: "Sierra Vista", slug: "sierra-vista", region: "Eastern Arizona", order: 55, population: 43888 },
  { name: "Benson", slug: "benson", region: "Eastern Arizona", order: 56, population: 4887 },
  { name: "Safford", slug: "safford", region: "Eastern Arizona", order: 57, population: 10129 },
  { name: "Thatcher", slug: "thatcher", region: "Eastern Arizona", order: 58, population: 5122 },
  
  // Other
  { name: "Nogales", slug: "nogales", region: "Other", order: 60, population: 19770 },
  { name: "Douglas", slug: "douglas", region: "Other", order: 61, population: 15462 },
  { name: "Somerton", slug: "somerton", region: "Other", order: 62, population: 14287 },
  { name: "San Luis", slug: "san-luis", region: "Other", order: 63, population: 35257 },
  { name: "Page", slug: "page", region: "Other", order: 64, population: 7440 },
  { name: "Holbrook", slug: "holbrook", region: "Other", order: 65, population: 4858 },
];

// Sample businesses for HVAC category in Mesa
export const sampleBusinesses = [
  {
    name: "Desert Cool HVAC Services",
    slug: "desert-cool-hvac-services",
    shortDescription: "Professional HVAC installation and repair serving Mesa for over 20 years",
    description: "Desert Cool HVAC Services is Mesa's trusted partner for all heating and cooling needs. With over two decades of experience in the Arizona heat, we specialize in energy-efficient installations, emergency repairs, and preventive maintenance.",
    phone: "(480) 555-0123",
    email: "info@desertcoolhvac.com",
    website: "https://desertcoolhvac.com",
    address: "123 Main Street",
    city: "Mesa",
    state: "AZ",
    zip: "85201",
    services: ["AC Installation", "Heating Repair", "Duct Cleaning", "Emergency Service", "Maintenance Plans"],
    planTier: "pro" as const,
    featured: true,
    priority: 100,
    rating: 4.8,
    reviewCount: 127,
    verified: true,
    active: true,
  },
  {
    name: "Reliable Air & Heat",
    slug: "reliable-air-heat",
    shortDescription: "24/7 emergency HVAC service with same-day repairs",
    description: "When your AC fails in the Arizona heat, you need help fast. Reliable Air & Heat provides 24/7 emergency service with certified technicians ready to restore your comfort quickly and affordably.",
    phone: "(480) 555-0456",
    email: "service@reliableairheat.com",
    address: "456 Oak Avenue",
    city: "Mesa",
    state: "AZ",
    zip: "85203",
    services: ["Emergency Repair", "AC Service", "Heat Pump Installation", "Indoor Air Quality"],
    planTier: "free" as const,
    featured: false,
    priority: 50,
    rating: 4.5,
    reviewCount: 89,
    verified: true,
    active: true,
  },
  {
    name: "Premium Climate Solutions",
    slug: "premium-climate-solutions",
    shortDescription: "High-efficiency HVAC systems and smart home integration specialists",
    description: "Premium Climate Solutions brings cutting-edge HVAC technology to Mesa homes and businesses. We specialize in high-efficiency systems, smart thermostats, and whole-home climate control solutions.",
    phone: "(480) 555-0789",
    email: "hello@premiumclimate.com",
    website: "https://premiumclimate.com",
    address: "789 Technology Parkway",
    city: "Mesa",
    state: "AZ",
    zip: "85205",
    services: ["Smart HVAC Systems", "Zone Control", "Energy Audits", "Commercial HVAC", "New Construction"],
    planTier: "power" as const,
    featured: true,
    priority: 150,
    rating: 4.9,
    reviewCount: 203,
    verified: true,
    active: true,
  },
];