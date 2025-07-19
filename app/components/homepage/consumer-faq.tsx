import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Search, Shield, Users, Clock } from "lucide-react";

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
    answer: "AZ Business Services is Arizona's trusted directory of verified local professionals. We connect homeowners and businesses with top-rated service providers across the state. All our professionals are verified, reviewed, and ready to help with your project needs.",
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    id: "how-to-find-pros",
    question: "How do I find the best service provider?",
    answer: "Simply search by service type and location. Browse verified professional profiles, read real customer reviews, compare ratings and services, then contact providers directly. No bidding wars or shared leads - just direct communication with your chosen professional.",
    icon: <Search className="h-5 w-5" />
  },
  {
    id: "are-businesses-verified",
    question: "Are the businesses verified?",
    answer: "Yes! All professionals in our directory go through a verification process including business license validation, phone verification, and documentation review. Look for the verification badge on business profiles for added peace of mind.",
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: "is-service-free",
    question: "Is the service free for homeowners?",
    answer: "Absolutely! Using AZ Business Services to find and contact professionals is completely free for customers. There are no hidden fees, membership costs, or charges to browse listings and connect with service providers.",
    icon: <Users className="h-5 w-5" />
  },
  {
    id: "how-fast-response",
    question: "How quickly will professionals respond?",
    answer: "Most verified professionals respond within 2-4 hours during business hours. Many offer same-day consultations or estimates. Response times vary by service type and professional availability, but our verified pros pride themselves on prompt communication.",
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: "quality-guarantee",
    question: "What if I'm not satisfied with the service?",
    answer: "While we don't directly provide the services, we carefully vet all professionals in our directory. If you have concerns about a service provider, please contact us immediately. We take feedback seriously and maintain high standards for all listed professionals.",
    icon: <Shield className="h-5 w-5" />
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
            Everything you need to know about finding trusted professionals in Arizona
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
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="border-t border-prickly-pear-pink/20 pt-4">
                      <div className="text-ironwood-charcoal/70 leading-relaxed">
                        <p>{item.answer}</p>
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
          <p className="text-ironwood-charcoal/70 mb-4">
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
              href="/about"
              className="inline-flex items-center px-6 py-3 border border-ocotillo-red text-ocotillo-red rounded-lg hover:bg-ocotillo-red hover:text-white transition-colors font-medium"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}