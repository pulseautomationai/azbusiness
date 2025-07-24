import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Search, Shield, Clock, Star, Phone, Brain, Building, MapPin, AlertCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const consumerFaqItems: FAQItem[] = [
  {
    id: "what-is-az-business",
    question: "What is AZ Business Services?",
    answer: `**Quick Answer:** Arizona's premier AI-powered business directory connecting you with verified, trusted local service providers.

**Detailed Explanation:**
• **AI-Powered Rankings** - Our intelligent system analyzes customer reviews, response times, and service quality to rank businesses by actual performance
• **Verified Professionals** - Every business is verified with real Arizona business licenses and customer feedback
• **Local Expertise** - Exclusively focused on Arizona businesses with deep understanding of local markets and needs
• **Quality First** - Unlike national platforms, we prioritize service quality and customer satisfaction over who pays the most

**Why Choose AZ Business:** Get matched with the best professionals, not just the highest bidders.`,
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    id: "how-to-find-pros",
    question: "How do I find the best service provider?",
    answer: `**Quick Answer:** Use our AI-powered search and rankings to discover top-rated professionals in your area.

**Detailed Explanation:**
• **Smart Search** - Enter your service need and location - our AI instantly shows the best-ranked providers
• **Performance Rankings** - Businesses are ranked by real customer satisfaction, response time, and service quality
• **Detailed Insights** - See AI-generated summaries of what customers actually say about each business
• **Local Focus** - Results prioritize Arizona businesses with proven local track records
• **Multiple Options** - Compare 3-5 top providers to find your perfect match

**Pro Tip:** Look for businesses with "Pro-Verified" or "Power-Tier" badges for enhanced service guarantees.`,
    icon: <Search className="h-5 w-5" />
  },
  {
    id: "are-businesses-verified",
    question: "Are the businesses verified?",
    answer: `**Quick Answer:** Yes! All businesses are verified through multiple methods including licenses, customer feedback, and owner verification.

**Detailed Explanation:**
• **Business License Verification** - We confirm active Arizona business licenses and proper certifications
• **Owner Verification** - Business owners must verify their identity and claim their listings
• **Customer Review Authentication** - AI analyzes review patterns to ensure authentic feedback
• **Continuous Monitoring** - Ongoing verification of business status and customer satisfaction
• **Verification Badges** - Look for ✅ badges indicating verification level (Basic, Professional, Pro-Verified, Power-Tier)

**Your Protection:** Verified businesses have proven track records and accountability you can trust.`,
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: "is-service-free",
    question: "Is the service free for homeowners?",
    answer: `**Quick Answer:** Absolutely! Finding and connecting with service providers is completely free for customers.

**Detailed Explanation:**
• **No Hidden Fees** - Search, browse, and contact businesses at no cost to you
• **Free AI Insights** - Access our intelligent business rankings and customer feedback analysis
• **Direct Contact** - Connect directly with businesses - no middleman fees or markups
• **Unlimited Searches** - Use our platform as much as you need to find the right professionals
• **No Account Required** - Browse and search without creating an account (though accounts unlock helpful features)

**The Value:** Businesses pay to be listed, so you get premium service discovery for free.`,
    icon: <Building className="h-5 w-5" />
  },
  {
    id: "how-fast-response",
    question: "How quickly will professionals respond?",
    answer: `**Quick Answer:** Most verified businesses respond within 2-4 hours, with many offering same-day service.

**Detailed Explanation:**
• **AI-Tracked Response Times** - Our system monitors and displays average response times for each business
• **Fast Responders Highlighted** - Businesses with quick response times get priority in rankings
• **Emergency Services** - Many Power-tier businesses offer 24/7 emergency response
• **Real-Time Availability** - Professional businesses update their availability and capacity regularly
• **Response Guarantees** - Higher-tier businesses often guarantee response times

**Typical Response Times:**
- **Emergency Services:** 15-30 minutes
- **Standard Requests:** 2-4 hours  
- **Project Estimates:** Same or next day`,
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: "quality-guarantee",
    question: "What if I'm not satisfied with the service?",
    answer: `**Quick Answer:** We prioritize customer satisfaction with review systems, business accountability, and resolution support.

**Detailed Explanation:**
• **Review System** - Leave honest reviews that help other customers and hold businesses accountable
• **Business Response** - Verified businesses can respond to reviews and address concerns publicly
• **Quality Monitoring** - Poor-performing businesses are flagged and may lose verification status
• **Direct Resolution** - Contact businesses directly for immediate issue resolution
• **Community Standards** - We maintain high standards and remove businesses that consistently underperform

**Your Voice Matters:** Your reviews directly impact business rankings and help protect other customers.`,
    icon: <AlertCircle className="h-5 w-5" />
  },
  {
    id: "ai-ranking-system",
    question: "How does the AI ranking system work?",
    answer: `**Quick Answer:** Our AI analyzes customer reviews, response times, service quality, and business performance to rank providers by actual results.

**Detailed Explanation:**
• **Review Analysis** - AI reads and understands customer feedback to identify service quality patterns
• **Performance Metrics** - Response time, completion rates, and customer satisfaction scores
• **Local Optimization** - Rankings consider Arizona-specific factors like seasonal demand and local expertise
• **Real-Time Updates** - Rankings update continuously as new reviews and performance data comes in
• **Transparency** - See why businesses rank where they do with clear performance indicators

**The Result:** Get matched with businesses that actually perform, not just those who pay for placement.`,
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: "vs-competitors",
    question: "How is this different from Thumbtack or Angi?",
    answer: `**Quick Answer:** We focus on quality over quantity with exclusive Arizona expertise, AI-powered insights, and no middleman markups.

**Detailed Explanation:**
• **Local Expertise** - Arizona-only focus with deep understanding of local markets and regulations
• **AI-Powered Quality** - Smart rankings based on actual performance, not who pays most for leads
• **Direct Connections** - Contact businesses directly without platform fees affecting their pricing
• **Exclusive Leads** - Our businesses get exclusive customer inquiries, ensuring better attention to your project
• **Professional Standards** - Higher verification standards and ongoing quality monitoring

**Key Differences:**
- **Thumbtack/Angi:** National platforms with shared leads and bidding wars
- **AZ Business:** Local expertise with quality-focused, direct connections`,
    icon: <Star className="h-5 w-5" />
  },
  {
    id: "service-types",
    question: "What types of services can I find?",
    answer: `**Quick Answer:** Over 38 service categories including HVAC, plumbing, landscaping, contractors, and professional services.

**Detailed Explanation:**
• **Home Services** - HVAC, plumbing, electrical, roofing, landscaping, pest control
• **Contractors** - General contractors, remodeling, flooring, painting, drywall
• **Professional Services** - Legal, accounting, real estate, insurance, consulting
• **Specialty Services** - Pool maintenance, security systems, cleaning services, pet care
• **Emergency Services** - 24/7 availability for urgent home and business needs
• **Seasonal Services** - Arizona-specific needs like AC maintenance and desert landscaping

**Browse by Category:** Easily find exactly what you need with our organized service categories.`,
    icon: <Building className="h-5 w-5" />
  },
  {
    id: "mobile-friendly",
    question: "Can I use this on my phone?",
    answer: `**Quick Answer:** Yes! Our platform is fully optimized for mobile with easy search, calling, and messaging features.

**Detailed Explanation:**
• **Mobile-Optimized** - Fast, responsive design that works perfectly on phones and tablets
• **One-Tap Calling** - Call businesses directly from their listing with one tap
• **Easy Navigation** - Intuitive mobile interface for quick searching and browsing
• **Location Services** - Automatically find services near your current location
• **Offline Access** - Save favorite businesses and access key information without internet

**On-the-Go Convenience:** Find help when you need it, wherever you are in Arizona.`,
    icon: <Phone className="h-5 w-5" />
  },
  {
    id: "best-businesses",
    question: "How do I know which businesses are the best?",
    answer: `**Quick Answer:** Look for AI rankings, verification badges, detailed customer insights, and response time indicators.

**Detailed Explanation:**
• **AI Performance Rankings** - Businesses ranked #1-5 in each category have proven track records
• **Verification Levels** - ✅ Basic → 🌟 Pro-Verified → ⚡ Power-Tier (increasing quality assurance)
• **Customer Insight Summaries** - AI-generated summaries of what customers actually say
• **Response Time Indicators** - See average response times and availability
• **Service Quality Metrics** - Performance indicators based on completion rates and satisfaction

**Quality Indicators to Look For:**
- **Top 3 AI Rankings** in your area
- **Pro-Verified or Power-Tier** badges
- **Fast response times** (under 4 hours)
- **Positive AI insights** from customer reviews`,
    icon: <Star className="h-5 w-5" />
  },
  {
    id: "arizona-focus",
    question: "Why focus only on Arizona businesses?",
    answer: `**Quick Answer:** Arizona has unique needs, regulations, and challenges that local experts understand best.

**Detailed Explanation:**
• **Climate Expertise** - Desert climate requires specialized knowledge for HVAC, landscaping, and construction
• **Local Regulations** - Arizona-specific licensing, permits, and building codes
• **Seasonal Patterns** - Understanding peak seasons, monsoon preparations, and desert living needs
• **Community Focus** - Supporting local Arizona businesses and keeping money in our communities
• **Faster Service** - Local businesses can respond quickly and understand your neighborhood

**Arizona Advantage:** Get service from professionals who truly understand desert living and local requirements.`,
    icon: <MapPin className="h-5 w-5" />
  }
];

interface ConsumerFAQProps {
  className?: string;
}

export default function ConsumerFAQ({ className = "" }: ConsumerFAQProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-medium mb-4 text-ironwood-charcoal">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
            Everything you need to know about finding trusted Arizona service providers with AI-powered rankings
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 max-w-6xl mx-auto">
          {consumerFaqItems.map((item, index) => {
            const isOpen = openItems.includes(item.id);
            
            return (
              <div 
                key={item.id}
                className="group hover:shadow-md transition-all duration-300 border border-prickly-pear-pink/20 bg-white rounded-xl"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-ocotillo-red focus:ring-inset rounded-lg"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 pr-4">
                      <div className="flex-shrink-0 text-ocotillo-red">
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-ironwood-charcoal group-hover:text-ocotillo-red transition-colors">
                        {item.question}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-cholla-green" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-ironwood-charcoal/50 group-hover:text-cholla-green transition-colors" />
                      )}
                    </div>
                  </div>
                </button>
                
                <div
                  id={`faq-answer-${item.id}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="border-t border-prickly-pear-pink/20 pt-4">
                      <div className="text-ironwood-charcoal/70 leading-relaxed space-y-3">
                        {item.answer.split('\n\n').map((paragraph, idx) => {
                          // Handle bullet points
                          if (paragraph.includes('•')) {
                            const lines = paragraph.split('\n');
                            return (
                              <div key={idx} className="space-y-1">
                                {lines.map((line, lineIdx) => {
                                  if (line.trim().startsWith('•')) {
                                    return (
                                      <div key={lineIdx} className="flex items-start ml-4">
                                        <span className="text-ocotillo-red mr-2 flex-shrink-0">•</span>
                                        <span dangerouslySetInnerHTML={{ 
                                          __html: line.replace(/•\s*/, '')
                                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-ironwood-charcoal">$1</strong>')
                                        }} />
                                      </div>
                                    );
                                  } else if (line.trim()) {
                                    return (
                                      <div key={lineIdx} dangerouslySetInnerHTML={{ 
                                        __html: line
                                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-ironwood-charcoal">$1</strong>')
                                      }} />
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            );
                          }
                          
                          // Handle regular paragraphs with markdown
                          return (
                            <p key={idx} dangerouslySetInnerHTML={{ 
                              __html: paragraph
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-ironwood-charcoal">$1</strong>')
                            }} />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-ironwood-charcoal mb-4">
            Ready to find your perfect Arizona service provider?
          </h3>
          <p className="text-lg text-ironwood-charcoal/80 mb-6 max-w-2xl mx-auto">
            Join thousands of Arizona homeowners who trust our AI-powered rankings to connect with verified local professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/search"
              className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg"
            >
              <Search className="mr-2 h-5 w-5" />
              Find a Professional
            </a>
            <a 
              href="/for-businesses"
              className="inline-flex items-center px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all font-medium"
            >
              Are You a Business? Learn More
            </a>
          </div>
          <p className="text-sm text-ironwood-charcoal/60 mt-4">
            100% Free for homeowners • No hidden fees • Direct connections
          </p>
        </div>
      </div>
    </section>
  );
}