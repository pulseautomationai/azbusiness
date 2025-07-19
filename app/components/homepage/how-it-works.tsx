import { Search, Users, Phone } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Search",
    description: "Tell us what you need",
    detail: "Search by service type and location to find verified professionals in your area",
    icon: Search,
    color: "prickly-pear-pink"
  },
  {
    number: "2", 
    title: "Compare",
    description: "Review verified pros and ratings",
    detail: "Browse profiles, read real customer reviews, and compare pricing and experience",
    icon: Users,
    color: "cholla-green"
  },
  {
    number: "3",
    title: "Connect",
    description: "Contact directly - no middleman fees",
    detail: "Reach out directly to your chosen professional. No bidding wars or hidden fees",
    icon: Phone,
    color: "ocotillo-red"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-agave-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
            How to Find Your Perfect Pro
          </h2>
          <p className="text-lg text-ironwood-charcoal/70 max-w-2xl mx-auto">
            Three simple steps to connect with Arizona's most trusted service professionals
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLastStep = index === steps.length - 1;
            
            return (
              <div key={index} className="relative">
                {/* Connection Line */}
                {!isLastStep && (
                  <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-prickly-pear-pink/30 to-transparent z-0"></div>
                )}
                
                <div className="relative bg-white rounded-xl p-6 md:p-8 border border-prickly-pear-pink/20 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-center mb-6">
                    <div className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-${step.color}/10 border-2 border-${step.color}/20`}>
                      <Icon className={`h-8 w-8 text-${step.color}`} />
                      <div className={`absolute -top-2 -right-2 h-6 w-6 rounded-full bg-${step.color} text-white text-xs font-semibold flex items-center justify-center`}>
                        {step.number}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-semibold text-ironwood-charcoal mb-2">
                      {step.title}
                    </h3>
                    <p className="text-base font-medium text-ironwood-charcoal/80 mb-3">
                      {step.description}
                    </p>
                    <p className="text-sm text-ironwood-charcoal/60 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}