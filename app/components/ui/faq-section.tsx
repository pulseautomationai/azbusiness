import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Building, CreditCard, Users, Shield, Zap, TrendingUp, DollarSign, Clock, Rocket } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const faqItems: FAQItem[] = [
  {
    id: "what-is-az-business",
    question: "What is AZ Business Services?",
    answer: "AZ Business Services is Arizona's most trusted local business directory. We help customers find verified, reviewed service providers while helping businesses grow their online presence and attract more leads through our comprehensive listing platform.",
    icon: <Building className="h-5 w-5" />
  },
  {
    id: "how-to-claim",
    question: "How do I claim my business listing?",
    answer: "Claiming your business is simple and free! Click 'Claim This Listing' on your business page, verify your ownership through a quick process, and start managing your profile immediately. You'll gain access to edit your information, respond to reviews, and track your listing performance.",
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    id: "free-vs-paid",
    question: "What's the difference between Free and Paid plans?",
    answer: "Free listings include basic business information and customer reviews. Paid plans ($29 Pro, $97 Power) offer premium features like priority placement in search results, lead management, AI-enhanced content, SEO tools, and dedicated support to help grow your business faster.",
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    id: "lead-generation",
    question: "How does lead generation work?",
    answer: "Pro and Power plan customers receive qualified leads directly to their inbox. Our platform matches customer inquiries with relevant businesses based on location, services, and customer preferences. Power plan includes automated lead routing and instant notifications.",
    icon: <Users className="h-5 w-5" />
  },
  {
    id: "verification-process",
    question: "What is the business verification process?",
    answer: "We verify businesses through multiple methods including business license validation, phone verification, and documentation review. Verified businesses receive a trust badge, improved search visibility, and customer confidence that comes with our quality assurance.",
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: "ai-features",
    question: "What AI features are included in the Power plan?",
    answer: "Power plan includes AI-powered business summary generation, service descriptions with pricing insights, social media content creation, SEO audit recommendations, competitor analysis, and monthly blog post creation to boost your online presence and search rankings.",
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: "seo-benefits",
    question: "How does listing help my SEO?",
    answer: "Your business listing provides valuable backlinks to your website, improves local search visibility, and creates consistent NAP (Name, Address, Phone) citations across the web. Power plan includes advanced SEO audits and keyword optimization recommendations.",
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: "pricing-billing",
    question: "How does pricing and billing work?",
    answer: "We offer transparent monthly pricing: Free (always), Pro ($29/month), and Power ($97/month). All paid plans are month-to-month with no long-term contracts. You can upgrade, downgrade, or cancel anytime through your account dashboard.",
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    id: "customer-support",
    question: "What kind of customer support do you provide?",
    answer: "Free users get community support and help docs. Pro users receive priority email support. Power plan customers get dedicated account management with direct phone support, strategy consultations, and hands-on assistance with profile optimization.",
    icon: <Users className="h-5 w-5" />
  },
  {
    id: "get-started",
    question: "How quickly can I get started?",
    answer: "You can claim your free listing and start getting visibility immediately! The entire process takes less than 5 minutes. For paid plans, premium features activate instantly upon subscription, and our team can help optimize your listing within 24 hours.",
    icon: <Clock className="h-5 w-5" />
  }
];

interface FAQSectionProps {
  className?: string;
}

export default function FAQSection({ className = "" }: FAQSectionProps) {
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
          <h2 className="font-serif text-3xl lg:text-4xl font-medium mb-4" style={{ color: '#2B2A28' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about getting started and growing your business with AZ Business Services.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {faqItems.map((item, index) => {
            const isOpen = openItems.includes(item.id);
            
            return (
              <div 
                key={item.id}
                className="group hover:shadow-md transition-all duration-300 border border-prickly-pear-pink bg-white rounded-xl"
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
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="border-t border-prickly-pear-pink/30 pt-4">
                      <p className="text-ironwood-charcoal/70 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="mailto:support@azbusinessservices.com"
              className="inline-flex items-center px-6 py-3 bg-ocotillo-red text-white rounded-lg hover:bg-ocotillo-red/90 transition-colors font-medium"
            >
              Contact Support
            </a>
            <a 
              href="/pricing"
              className="inline-flex items-center px-6 py-3 border border-ocotillo-red text-ocotillo-red rounded-lg hover:bg-ocotillo-red hover:text-white transition-colors font-medium"
            >
              View All Plans
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}