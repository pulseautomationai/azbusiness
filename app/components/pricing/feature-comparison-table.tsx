import React, { useState, useEffect } from "react";
import { Check, X, Info, Lock, Brain, BarChart3, Palette, Star, MessageCircle, Target, Wrench, ChevronDown, ChevronUp, Sparkles, TrendingUp, Zap, Settings, Building, Shield, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface FeatureComparisonTableProps {
  className?: string;
}

// Tier configuration with colors and badges
const tierConfig = {
  free: {
    name: "Free",
    price: "$0/month",
    color: "gray",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-600",
    accentColor: "text-gray-700",
    badge: null,
  },
  starter: {
    name: "Starter",
    price: "$9/month",
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-600",
    accentColor: "text-blue-700",
    badge: null,
  },
  pro: {
    name: "Pro",
    price: "$29/month",
    color: "amber",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    accentColor: "text-amber-800",
    badge: "MOST POPULAR",
  },
  power: {
    name: "Power",
    price: "$97/month",
    color: "emerald",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    accentColor: "text-emerald-800",
    badge: "BEST VALUE",
  },
};

const featureCategories = [
  {
    id: "ai",
    name: "AI Insights & Intelligence",
    icon: Brain,
    description: "AI-powered insights that help you understand and grow your business",
    features: [
      {
        name: "Basic AI insights",
        description: "Customer feedback summary",
        free: true,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Enhanced AI analysis",
        description: "Detailed customer feedback analysis",
        free: false,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Editable AI summary",
        description: "Control your business description",
        free: false,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Professional AI display",
        description: "Consumer-facing AI insights",
        free: false,
        starter: false,
        pro: true,
        power: true,
      },
      {
        name: "Advanced AI intelligence",
        description: "Real-time comprehensive analysis",
        free: false,
        starter: false,
        pro: false,
        power: true,
      },
    ],
  },
  {
    id: "analytics",
    name: "Performance & Analytics",
    icon: BarChart3,
    description: "Track your performance and see how you compare",
    features: [
      {
        name: "Performance tracking",
        description: "Track your performance metrics",
        free: false,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Ranking position visible",
        description: "See your exact ranking position",
        free: false,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Competitive analysis",
        description: "Compare to area average",
        free: false,
        starter: false,
        pro: true,
        power: true,
      },
    ],
  },
  {
    id: "listing",
    name: "Business Listing & Control",
    icon: Settings,
    description: "Control how your business appears to customers",
    features: [
      {
        name: "Basic business listing",
        description: "Name, address, phone, hours",
        free: true,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Verified business badge",
        description: "Show customers you're verified",
        free: true,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Professional logo upload",
        description: "Add your business logo",
        free: false,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Advanced business editing",
        description: "Services, specialties, certifications",
        free: false,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Content editing control",
        description: "Full control over your listing",
        free: false,
        starter: false,
        pro: true,
        power: true,
      },
    ],
  },
  {
    id: "presentation",
    name: "Professional Presentation",
    icon: Palette,
    description: "Make a great first impression with professional tools",
    features: [
      {
        name: "Mobile-optimized profile",
        description: "Responsive on all devices",
        free: true,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Service presentation",
        description: "How services are displayed",
        free: "None",
        starter: "Basic list",
        pro: "Enhanced cards",
        power: "Enhanced cards",
      },
      {
        name: "Professional image gallery",
        description: "Showcase your work with photos",
        free: false,
        starter: false,
        pro: false,
        power: true,
      },
    ],
  },
  {
    id: "visibility",
    name: "Visibility & Featuring",
    icon: Star,
    description: "Stand out from competitors with enhanced visibility",
    features: [
      {
        name: "Appears in AI rankings",
        description: "Compete in performance rankings",
        free: true,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "SEO backlink to website",
        description: "Direct link for search engines",
        free: false,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Multiple featured placements",
        description: "6 different featuring opportunities",
        free: false,
        starter: false,
        pro: true,
        power: true,
      },
      {
        name: "Homepage featured placement",
        description: "Premium homepage visibility",
        free: false,
        starter: false,
        pro: false,
        power: true,
      },
      {
        name: "Local market leader positioning",
        description: "Dominate your category",
        free: false,
        starter: false,
        pro: false,
        power: true,
      },
    ],
  },
  {
    id: "engagement",
    name: "Customer Engagement",
    icon: MessageCircle,
    description: "Build relationships with your customers",
    features: [
      {
        name: "Google reviews display",
        description: "Show customer reviews",
        free: "3",
        starter: "8",
        pro: "15",
        power: "Unlimited",
      },
      {
        name: "Review response capability",
        description: "Respond to customer feedback",
        free: false,
        starter: false,
        pro: true,
        power: true,
      },
      {
        name: "AI review analysis",
        description: "Sentiment and keyword analysis",
        free: false,
        starter: false,
        pro: false,
        power: true,
      },
      {
        name: "Active badge system",
        description: "Display achievements",
        free: false,
        starter: false,
        pro: true,
        power: true,
      },
    ],
  },
  {
    id: "leads",
    name: "Lead Generation",
    icon: Target,
    description: "Convert visitors into paying customers",
    features: [
      {
        name: "Contact form enabled",
        description: "Receive customer inquiries",
        free: false,
        starter: false,
        pro: false,
        power: true,
      },
      {
        name: "Exclusive lead capture",
        description: "Leads not shared with competitors",
        free: false,
        starter: false,
        pro: false,
        power: "Unlimited",
      },
      {
        name: "Lead notifications",
        description: "Instant alerts for new leads",
        free: false,
        starter: false,
        pro: false,
        power: true,
      },
      {
        name: "Lead tracking & management",
        description: "Organize and track leads",
        free: false,
        starter: false,
        pro: false,
        power: true,
      },
    ],
  },
  {
    id: "support",
    name: "Support & Resources",
    icon: Wrench,
    description: "Get the help and resources you need to succeed",
    features: [
      {
        name: "Community support",
        description: "Help documentation",
        free: true,
        starter: true,
        pro: true,
        power: true,
      },
      {
        name: "Monthly performance reports",
        description: "Detailed analytics reports",
        free: false,
        starter: false,
        pro: true,
        power: true,
      },
      {
        name: "Priority customer support",
        description: "Dedicated assistance",
        free: false,
        starter: false,
        pro: false,
        power: true,
      },
    ],
  },
];

// Feature value display component
const FeatureValue = ({ value, tierColor, tierConfig, featureName }: { value: any; tierColor: string; tierConfig: any; featureName?: string }) => {
  if (typeof value === "boolean") {
    return value ? (
      <div className="flex items-center justify-center">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shadow-sm",
          tierConfig.bgColor,
          tierColor === "gray" && "bg-gray-200",
          tierColor === "blue" && "bg-blue-500",
          tierColor === "amber" && "bg-amber-500",
          tierColor === "emerald" && "bg-emerald-500"
        )}>
          <Check className={cn(
            "h-4 w-4 font-bold",
            tierColor === "gray" && "text-gray-600",
            tierColor !== "gray" && "text-white"
          )} />
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center">
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    );
  }
  
  // Special styling for certain values
  if (value === "Unlimited") {
    return (
      <div className="flex items-center justify-center">
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm",
          tierConfig.bgColor,
          tierConfig.accentColor
        )}>
          <Sparkles className="h-3 w-3" />
          <span>{value}</span>
        </div>
      </div>
    );
  }
  
  // Special styling for specific text values
  if (typeof value === "string") {
    // Review counts or numeric values
    if (!isNaN(parseInt(value))) {
      return (
        <div className="flex items-center justify-center">
          <div className={cn(
            "px-3 py-1 rounded-md font-bold shadow-sm",
            tierConfig.bgColor
          )}>
            <span className={cn("text-sm", tierConfig.accentColor)}>{value}</span>
          </div>
        </div>
      );
    }
    
    // Service presentation values
    if (value.includes("list") || value.includes("cards") || value === "None") {
      return (
        <div className="flex items-center justify-center">
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            value === "None" && "text-gray-400 bg-gray-50",
            value === "Basic list" && "text-blue-600 bg-blue-50",
            value === "Enhanced cards" && "text-amber-600 bg-amber-50"
          )}>
            {value}
          </span>
        </div>
      );
    }
  }
  
  return (
    <div className="flex items-center justify-center">
      <span className={cn("text-sm font-semibold", tierConfig.accentColor)}>{value}</span>
    </div>
  );
};

export default function FeatureComparisonTable({ className = "" }: FeatureComparisonTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["ai", "leads"]);
  const [selectedTier, setSelectedTier] = useState<string | null>("starter");
  const [isSticky, setIsSticky] = useState(false);

  // Handle sticky header on mobile
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const expandAll = () => {
    setExpandedCategories(featureCategories.map(cat => cat.id));
  };

  const collapseAll = () => {
    setExpandedCategories([]);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Compact Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Compare All Features
        </h2>
        <p className="text-base text-gray-600 max-w-xl mx-auto">
          Find the perfect plan for your business
        </p>
      </div>

      {/* Mobile Tier Selector - Compact */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {Object.entries(tierConfig).map(([key, tier]) => (
            <button
              key={key}
              onClick={() => setSelectedTier(key)}
              className={cn(
                "p-2 rounded-lg border-2 transition-all",
                selectedTier === key
                  ? `${tier.borderColor} ${tier.bgColor}`
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="font-semibold text-sm">{tier.name}</div>
              <div className="text-xs text-gray-600">{tier.price}</div>
              {tier.badge && (
                <Badge variant="secondary" className="mt-0.5 text-xs py-0">
                  {tier.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Integrated Desktop Comparison Table */}
      <div className="hidden md:block">
        <Card className="overflow-hidden shadow-lg">
          {/* Integrated Tier Headers */}
          <div className="grid grid-cols-5 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="p-4 border-r border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Features</span>
                <button
                  onClick={expandedCategories.length === featureCategories.length ? collapseAll : expandAll}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                >
                  {expandedCategories.length === featureCategories.length ? (
                    <>
                      Collapse all
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Expand all
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
            {Object.entries(tierConfig).map(([key, tier]) => (
              <div
                key={key}
                className={cn(
                  "p-4 text-center border-r last:border-r-0 border-gray-200 relative",
                  tier.bgColor
                )}
              >
                {tier.badge && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs",
                      tier.color === "amber" && "bg-amber-500 text-white",
                      tier.color === "emerald" && "bg-emerald-500 text-white"
                    )}
                  >
                    {tier.badge}
                  </Badge>
                )}
                <h3 className={cn("text-lg font-bold", tier.accentColor)}>
                  {tier.name}
                </h3>
                <p className={cn("text-base font-semibold mt-1", tier.textColor)}>
                  {tier.price}
                </p>
              </div>
            ))}
          </div>

          {/* Compact Feature Categories */}
          <div className="">
            {featureCategories.map((category, categoryIdx) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories.includes(category.id);

              return (
                <div key={category.id} className="border-t border-gray-200 first:border-t-0">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full grid grid-cols-5 gap-0 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="p-2.5 flex items-center gap-2.5 col-span-1">
                      <div className={cn(
                        "rounded-md flex items-center justify-center transition-transform group-hover:scale-110",
                        category.id === "leads" ? "w-10 h-8 px-2" : "w-8 h-8",
                        category.id === "ai" && "bg-purple-100 text-purple-600",
                        category.id === "analytics" && "bg-blue-100 text-blue-600",
                        category.id === "listing" && "bg-gray-100 text-gray-600",
                        category.id === "presentation" && "bg-pink-100 text-pink-600",
                        category.id === "visibility" && "bg-amber-100 text-amber-600",
                        category.id === "engagement" && "bg-indigo-100 text-indigo-600",
                        category.id === "leads" && "bg-emerald-100 text-emerald-600",
                        category.id === "support" && "bg-slate-100 text-slate-600"
                      )}>
                        <Icon className={cn(
                          "h-4 w-4",
                          category.id === "leads" && "h-5 w-5"
                        )} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                          {category.name}
                          {category.id === "leads" && (
                            <Badge variant="default" className="bg-emerald-500 text-xs py-0 px-1.5">
                              Save $80-100/lead
                            </Badge>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500 hidden xl:block mt-0.5">
                          {category.description}
                        </p>
                      </div>
                      <div className="ml-auto mr-3">
                        <div className={cn(
                          "transition-transform duration-200",
                          isExpanded ? "rotate-180" : ""
                        )}>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    {/* Quick summary for each tier when collapsed */}
                    {!isExpanded && (
                      <>
                        <div className="p-2.5 text-center text-xs text-gray-500">
                          {category.features.filter(f => f.free).length} features
                        </div>
                        <div className="p-2.5 text-center text-xs text-blue-600 font-medium">
                          {category.features.filter(f => f.starter).length} features
                        </div>
                        <div className="p-2.5 text-center text-xs text-amber-600 font-medium">
                          {category.features.filter(f => f.pro).length} features
                        </div>
                        <div className="p-2.5 text-center text-xs text-emerald-600 font-medium">
                          {category.features.filter(f => f.power).length} features
                        </div>
                      </>
                    )}
                  </button>

                  {/* Expanded Features */}
                  {isExpanded && (
                    <div className="bg-gray-50/50">
                      {category.features.map((feature, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-0 border-t border-gray-100 hover:bg-white transition-colors">
                          <div className="py-1.5 px-2 pl-12 flex items-center gap-1.5">
                            <span className="text-sm text-gray-700">{feature.name}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs max-w-xs">{feature.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="py-1.5 px-2">
                            <FeatureValue value={feature.free} tierColor="gray" tierConfig={tierConfig.free} featureName={feature.name} />
                          </div>
                          <div className="py-1.5 px-2">
                            <FeatureValue value={feature.starter} tierColor="blue" tierConfig={tierConfig.starter} featureName={feature.name} />
                          </div>
                          <div className="py-1.5 px-2">
                            <FeatureValue value={feature.pro} tierColor="amber" tierConfig={tierConfig.pro} featureName={feature.name} />
                          </div>
                          <div className="py-1.5 px-2">
                            <FeatureValue value={feature.power} tierColor="emerald" tierConfig={tierConfig.power} featureName={feature.name} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Mobile Compact Categories */}
      <div className="md:hidden space-y-2">
        {featureCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <Card key={category.id} className="overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "rounded-md flex items-center justify-center",
                      category.id === "leads" ? "w-10 h-8 px-2" : "w-8 h-8",
                      category.id === "ai" && "bg-purple-100 text-purple-600",
                      category.id === "analytics" && "bg-blue-100 text-blue-600",
                      category.id === "listing" && "bg-gray-100 text-gray-600",
                      category.id === "presentation" && "bg-pink-100 text-pink-600",
                      category.id === "visibility" && "bg-amber-100 text-amber-600",
                      category.id === "engagement" && "bg-indigo-100 text-indigo-600",
                      category.id === "leads" && "bg-emerald-100 text-emerald-600",
                      category.id === "support" && "bg-slate-100 text-slate-600"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        category.id === "leads" && "h-5 w-5"
                      )} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      {!isExpanded && (
                        <p className="text-xs text-gray-500">
                          {category.features.filter(f => f[selectedTier as keyof typeof f]).length} features included
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {category.id === "leads" && selectedTier === "power" && (
                      <Badge variant="default" className="bg-emerald-500 text-xs py-0 px-1">
                        💰
                      </Badge>
                    )}
                    <div className={cn(
                      "transition-transform duration-200",
                      isExpanded ? "rotate-180" : ""
                    )}>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </button>

              <div className={cn(
                "overflow-hidden transition-all duration-300",
                isExpanded ? "max-h-[2000px]" : "max-h-0"
              )}>
                <CardContent className="p-0 border-t">
                  {/* Mobile View - Compact */}
                  <div className="md:hidden">
                    {category.features.map((feature, idx) => (
                      <div key={idx} className="p-2.5 border-b last:border-b-0 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pr-2">
                            <h4 className="text-sm font-medium text-gray-900">{feature.name}</h4>
                            <p className="text-xs text-gray-600 mt-0.5">{feature.description}</p>
                          </div>
                          {selectedTier && (
                            <div className="flex-shrink-0">
                              <FeatureValue 
                                value={feature[selectedTier as keyof typeof feature]} 
                                tierColor={tierConfig[selectedTier as keyof typeof tierConfig].color}
                                tierConfig={tierConfig[selectedTier as keyof typeof tierConfig]}
                                featureName={feature.name}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block">
                    <div className="divide-y">
                      {category.features.map((feature, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{feature.name}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs max-w-xs">{feature.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FeatureValue value={feature.free} tierColor="gray" tierConfig={tierConfig.free} featureName={feature.name} />
                          <FeatureValue value={feature.starter} tierColor="blue" tierConfig={tierConfig.starter} featureName={feature.name} />
                          <FeatureValue value={feature.pro} tierColor="amber" tierConfig={tierConfig.pro} featureName={feature.name} />
                          <FeatureValue value={feature.power} tierColor="emerald" tierConfig={tierConfig.power} featureName={feature.name} />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA - Compact */}
      <div className="text-center pt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Ready to grow your business?
        </h3>
        <p className="text-base text-gray-600 mb-6">
          Join 500+ Arizona businesses already using our platform
        </p>
        <div className="flex justify-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <a href="/add-business">
              <Shield className="mr-2 h-4 w-4" />
              Claim/Verify Your Listing (Free)
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}