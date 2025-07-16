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
    answer: "AZ Business Services is Arizona's premier business directory connecting local customers with verified service providers. Unlike lead generation platforms that charge per shared lead, we provide professional directory listings with AI-enhanced features and exclusive lead capture for predictable monthly pricing.",
    icon: <Building className="h-5 w-5" />
  },
  {
    id: "how-to-claim",
    question: "How do I claim my business listing?",
    answer: "Claiming your business is simple and free! Find your business listing, click \"Claim This Listing,\" verify your ownership through our quick verification process, and choose your plan. You'll immediately gain access to edit your profile and start managing your professional presence.",
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    id: "plan-differences",
    question: "What's the difference between Starter, Pro, and Power plans?",
    answer: "Starter ($9/month): Professional directory presence with AI-generated summary, verification badge, and basic contact info. Contact form disabled with upgrade prompts.\n\nPro ($29/month): Everything in Starter plus editable content, enhanced service presentation, featured category placement, and extended review display. No lead generation - contact form remains disabled.\n\nPower ($97/month): Everything in Pro plus unlimited exclusive lead capture, AI business intelligence, customer insights analysis, professional image gallery, and homepage featuring.",
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    id: "lead-generation",
    question: "How does lead generation work?",
    answer: "Only Power plan customers ($97/month) receive exclusive leads directly to their inbox when potential customers submit inquiries through their directory listing. Unlike Thumbtack or Angi, leads aren't shared with 3-5 competitors. Pro customers get enhanced visibility and professional presentation, but must upgrade to Power for actual lead capture.",
    icon: <Users className="h-5 w-5" />
  },
  {
    id: "ai-features",
    question: "What AI features are included?",
    answer: "All Plans: AI-generated professional business summary\n\nPower Plan: Advanced AI features including complete business intelligence analysis, customer sentiment analysis of all reviews, competitive positioning insights, AI-powered service descriptions and strategic recommendations, and professional presentation optimization.",
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: "get-started",
    question: "How quickly can I get started?",
    answer: "You can claim your listing and start receiving visibility immediately! The entire process takes less than 5 minutes. For paid plans, premium features activate instantly upon subscription, and our team can help optimize your listing within 24 hours.",
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: "pricing-billing",
    question: "How does pricing and billing work?",
    answer: "We offer transparent monthly pricing: Starter ($9), Pro ($29), and Power ($97). All plans are month-to-month with no long-term contracts. You can upgrade, downgrade, or cancel anytime through your account dashboard. Annual plans save 25% with same flexibility.",
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    id: "vs-competitors",
    question: "How is this different from Thumbtack or Angi?",
    answer: "Exclusive leads (not shared with 3-5 contractors), predictable monthly pricing (vs $80-100 per lead), professional directory presence (vs basic contractor profiles), AI-enhanced listings, and Arizona-focused local expertise. We provide better value and professional presentation.",
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: "customer-support",
    question: "What kind of customer support do you provide?",
    answer: "All Plans: Community support and help documentation\n\nPower: Priority customer support with dedicated assistance for lead management and profile optimization",
    icon: <Users className="h-5 w-5" />
  },
  {
    id: "verification-process",
    question: "How does the business verification process work?",
    answer: "We verify businesses through multiple methods including business license validation, phone verification, and documentation review. For businesses with existing Google My Business profiles, we offer instant verification through Google My Business authorization - simply sign up and verify instantly. Verified businesses receive a trust badge, improved search visibility, and customer confidence that comes with our quality assurance process.",
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: "see-results",
    question: "Can I see results before upgrading?",
    answer: "Yes! Starter and Pro listings provide professional credibility and enhanced visibility. You can see your listing performance and visitor engagement. To actually capture leads from visitors, you'll need to upgrade to Power plan.",
    icon: <Rocket className="h-5 w-5" />
  },
  {
    id: "power-value",
    question: "What makes the Power plan worth $97/month?",
    answer: "Power plan delivers equivalent value of $1,200+/month in business tools: professional consultation ($500), customer analytics ($200), website-quality presentation ($200), AI business intelligence ($200), unlimited exclusive leads ($400+). Most customers see ROI within the first month.",
    icon: <DollarSign className="h-5 w-5" />
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
                      <div className="text-ironwood-charcoal/70 leading-relaxed space-y-3">
                        {item.answer.split('\n\n').map((paragraph, index) => (
                          <p key={index} className={paragraph.includes(':') ? 'font-medium' : ''}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
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