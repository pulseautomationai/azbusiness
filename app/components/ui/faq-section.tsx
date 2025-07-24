import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Building, CreditCard, Users, Shield, Zap, TrendingUp, DollarSign, Clock, Rocket, Star, Target, BarChart3, Brain, Award, MapPin } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
  category?: "claiming" | "pricing" | "features" | "competitive" | "support";
  priority?: number;
}

const faqItems: FAQItem[] = [
  {
    id: "what-is-az-business",
    question: "What is AZ Business Services?",
    answer: `**Quick Answer:** Arizona's fastest-growing AI-powered business directory with predictable pricing and exclusive leads.

**What makes us different:**
• **AI-Powered Insights** - Every business gets AI analysis, from basic summaries (Free) to advanced intelligence (Power)
• **Predictable Pricing** - No more $80-100 per shared lead like Thumbtack/Angi
• **100% Exclusive Leads** - Power tier leads aren't shared with 3-5 competitors
• **Arizona Focus** - Local optimization and community support
• **Professional Presentation** - Not just another basic directory listing

**💡 Example:** Instead of paying $400-500/month for 5 shared leads on Thumbtack, get unlimited exclusive leads for $97/month.

**Next Step:** Claim your free listing today and see the difference.`,
    icon: <Building className="h-5 w-5" />,
    category: "features",
    priority: 1
  },
  {
    id: "how-to-claim",
    question: "How do I claim my business listing?",
    answer: `**Quick Answer:** Claim your listing free in 2 minutes - no credit card required.

**The simple process:**
1. **Find Your Business** - Search by name or browse categories
2. **Click "Claim This Listing"** - Green button on any unclaimed listing
3. **Verify Ownership** - Quick phone or document verification
4. **Choose Your Plan** - Start free or select a paid tier

**🎁 Immediate Benefits (even on Free plan):**
• Verified Business Owner badge
• Basic AI insights about your business
• Participate in AI rankings
• Display 3 Google reviews
• Edit basic business information

**💡 Pro Tip:** Even the free plan puts you ahead of unclaimed listings with verification and AI insights.

**Next Step:** Search for your business now and claim it free.`,
    icon: <Award className="h-5 w-5" />,
    category: "claiming",
    priority: 2
  },
  {
    id: "plan-differences",
    question: "What's the difference between tiers?",
    answer: `**Quick Answer:** Each tier builds on the previous with more AI insights, visibility, and features - only Power includes lead generation.

**🆓 FREE - Claim & Verify ($0)**
• ✅ Claim your listing (no credit card required)
• ✅ Verified Business Owner badge
• ✅ Basic AI insights (positive feedback summary)
• ✅ Compete in rankings (can't see position)
• ✅ Display 3 Google reviews
• ❌ No logo, advanced editing, or lead generation

**🚀 STARTER - See Your Ranking ($9/month)**
• Everything in Free PLUS:
• ✅ **See your exact ranking position** (#3 or #15?)
• ✅ Professional logo upload
• ✅ Enhanced AI insights (detailed analysis)
• ✅ Edit AI-generated summary
• ✅ SEO backlink to your website
• ✅ Display 8 Google reviews
• ❌ Still no lead generation

**🌟 PRO - Stand Out ($29/month)**
• Everything in Starter PLUS:
• ✅ **6 featured placement opportunities**
• ✅ Enhanced service cards (not just bullets)
• ✅ Respond to customer reviews
• ✅ Professional AI display for consumers
• ✅ Competitive analysis insights
• ✅ Display 15 Google reviews
• ❌ Ready for leads? Upgrade to Power

**⚡ POWER - Generate Leads ($97/month)**
• Everything in Pro PLUS:
• ✅ **UNLIMITED EXCLUSIVE LEADS**
• ✅ Homepage featured placement
• ✅ Professional image gallery
• ✅ Advanced AI business intelligence
• ✅ Display unlimited reviews
• ✅ Priority support

**💡 Upgrade Triggers:**
• Want to see your ranking? → Starter
• Need more visibility? → Pro
• Ready for leads? → Power`,
    icon: <BarChart3 className="h-5 w-5" />,
    category: "pricing",
    priority: 3
  },
  {
    id: "lead-generation",
    question: "How does lead generation work?",
    answer: `**Quick Answer:** Power tier gets unlimited exclusive leads for $97/month - not shared with competitors like Thumbtack/Angi.

**The Power Tier Advantage:**
• **100% Exclusive** - Your leads aren't shared with 3-5 competitors
• **Direct to Inbox** - Customer inquiries come straight to you
• **Unlimited Volume** - No per-lead charges or limits
• **Pre-Qualified** - Customers see your reviews, services, and AI insights before contacting

**💰 Cost Comparison:**
• **Thumbtack/Angi:** $80-100 per shared lead (shared with 3-5 contractors)
• **AZ Business Power:** $97/month for unlimited exclusive leads
• **Break-even:** Just 1-2 leads per month!

**📊 Real Example:**
Average Power customer receives 15-20 exclusive leads/month
• On Thumbtack: $1,200-2,000 (if all were exclusive)
• On AZ Business: $97 flat rate
• **You save: $1,100-1,900 per month**

**⚠️ Note:** Only Power tier includes lead generation. Pro tier provides professional visibility but no lead capture.

**Next Step:** Calculate your ROI - how much do you spend on shared leads now?`,
    icon: <Target className="h-5 w-5" />,
    category: "features",
    priority: 4
  },
  {
    id: "ai-features",
    question: "What AI features are included?",
    answer: `**Quick Answer:** Every tier gets AI insights - from basic summaries (Free) to advanced business intelligence (Power).

**🤖 AI Value Ladder:**

**🆓 FREE - Basic AI Insights**
• Simple positive feedback summary
• Basic business description
• Entry-level AI benefits
• *Example: "Customers love the fast service and friendly staff"*

**🚀 STARTER - Enhanced AI Analysis**
• Detailed customer feedback analysis
• Editable AI-generated summary
• Service extraction from reviews
• Performance insights
• *Example: "87% mention fast response, 76% praise professionalism"*

**🌟 PRO - Professional AI Display**
• Everything in Starter PLUS:
• Consumer-facing AI insights
• Competitive analysis (vs area average)
• Professional presentation
• *Example: "Ranks #3 in customer satisfaction, 15% above area average"*

**⚡ POWER - Advanced AI Intelligence**
• Everything in Pro PLUS:
• Real-time business intelligence
• Sentiment analysis (all reviews)
• AI-powered service descriptions
• Strategic recommendations
• Predictive insights
• *Example: "Opportunity: Add emergency services based on 23% request rate"*

**💡 Key Insight:** AI improves over time as more data is collected, making early adoption advantageous.

**Next Step:** Start with any tier and watch AI insights grow with your business.`,
    icon: <Brain className="h-5 w-5" />,
    category: "features",
    priority: 5
  },
  {
    id: "see-results",
    question: "Can I see results before upgrading?",
    answer: `**Quick Answer:** Yes! Start free and see immediate value, then upgrade when ready for more.

**🆓 FREE Tier - Immediate Value**
• Verified badge builds trust instantly
• Basic AI insights show customer sentiment
• Compete in rankings (even if you can't see position)
• 3 Google reviews provide social proof

**🚀 STARTER - Track Your Progress**
• See your exact ranking position
• Monitor performance trends
• Enhanced AI shows what customers value
• Professional logo increases credibility

**🌟 PRO - Visibility Results**
• Featured placement drives more views
• Enhanced service cards improve engagement
• Review responses build relationships
• Track visitor engagement metrics

**⚡ Ready for Leads?**
Once you see the traffic Pro brings, upgrade to Power to convert those visitors into paying customers.

**💯 Money-Back Guarantee:** Not satisfied? Cancel anytime with no penalties.

**Next Step:** Start free today and upgrade when you see the value.`,
    icon: <Rocket className="h-5 w-5" />,
    category: "features",
    priority: 7
  },
  {
    id: "power-value",
    question: "What makes the Power plan worth $97/month?",
    answer: `**Quick Answer:** Just 1-2 leads pays for the entire month, plus you get enterprise-level business tools.

**💰 ROI Calculator:**
• **Your cost:** $97/month flat rate
• **Competitor cost:** $80-100 per shared lead
• **Break-even:** Just 1-2 leads per month
• **Average Power user:** 15-20 exclusive leads/month
• **Your savings:** $1,100-1,900 monthly

**📦 What's Included (Value: $1,800+/month):**
• Unlimited exclusive leads (Value: $1,200+)
• Homepage featured placement (Value: $200)
• Professional image gallery (Value: $100)
• Advanced AI intelligence (Value: $200)
• Priority support (Value: $100)
• Unlimited review display
• Real-time analytics

**📊 Real Customer Results:**
• HVAC contractor: 18 leads/month, closed 6 = $12,000 revenue
• Plumber: 22 leads/month, closed 8 = $8,000 revenue
• Electrician: 15 leads/month, closed 5 = $7,500 revenue

**🌟 Exclusive Benefits:**
• Leads come pre-qualified (saw your profile first)
• No bidding wars with competitors
• Build long-term customer relationships
• Predictable monthly budget

**Next Step:** Calculate your current per-lead spend and see the savings.`,
    icon: <DollarSign className="h-5 w-5" />,
    category: "pricing",
    priority: 8
  },
  {
    id: "vs-competitors",
    question: "How is this different from Thumbtack or Angi?",
    answer: `**Quick Answer:** We offer predictable pricing, exclusive leads, AI insights, and Arizona focus - not $80-100 shared leads.

**📊 Key Differences:**

**Pricing Model:**
• **Thumbtack/Angi:** $80-100 per lead (variable monthly cost)
• **AZ Business:** $0-97/month flat rate (predictable budget)
• **Advantage:** Know exactly what you'll spend each month

**Lead Quality:**
• **Thumbtack/Angi:** Shared with 3-5 competitors (bidding war)
• **AZ Business:** 100% exclusive to you (Power tier)
• **Advantage:** No competition for your own leads

**Professional Presence:**
• **Thumbtack/Angi:** Basic contractor profile
• **AZ Business:** Full business listing with AI insights
• **Advantage:** Build trust before the first contact

**AI Technology:**
• **Thumbtack/Angi:** No AI features
• **AZ Business:** AI insights at every tier
• **Advantage:** Data-driven business improvement

**Local Focus:**
• **Thumbtack/Angi:** National platform
• **AZ Business:** 100% Arizona-focused
• **Advantage:** Local SEO and community support

**💰 Real Cost Example:**
5 leads per month:
• Thumbtack: $400-500 (shared with competitors)
• AZ Business Power: $97 (exclusive to you)
**You save: $300-400 monthly**

**Next Step:** Stop overpaying for shared leads - claim your listing today.`,
    icon: <TrendingUp className="h-5 w-5" />,
    category: "competitive",
    priority: 6
  },
  {
    id: "arizona-focus",
    question: "Why should I choose AZ Business over national platforms?",
    answer: `**Quick Answer:** Local expertise, community support, and Arizona-specific optimization that national platforms can't match.

**🌵 Arizona Advantages:**

**Local SEO Optimization:**
• Arizona-specific keywords and search patterns
• City and neighborhood-level targeting
• Local market understanding
• Regional service area optimization

**Community Connection:**
• Support local Arizona businesses
• Network with other local providers
• Arizona-based customer support
• Understanding of local regulations

**Market Intelligence:**
• Arizona pricing insights
• Seasonal demand patterns
• Local competition analysis
• Regional growth opportunities

**📊 Platform Benefits:**
• **Lower Competition:** Fewer businesses than national platforms
• **Higher Visibility:** Easier to rank in your category
• **Better Conversion:** Customers prefer local directories
• **Community Trust:** "Support Local" messaging

**💡 Real Impact:**
"Since switching from Angi, our local visibility increased 3x and we're saving $400/month on leads" - Phoenix HVAC Company

**Next Step:** Join Arizona's business community today.`,
    icon: <MapPin className="h-5 w-5" />,
    category: "competitive",
    priority: 9
  },
  {
    id: "quick-results",
    question: "How quickly will I see results after upgrading?",
    answer: `**Quick Answer:** Immediate benefits activate instantly, with meaningful results typically within 7-14 days.

**⏱️ Immediate Results (Day 1):**
• **All Tiers:** Features activate instantly
• **Starter:** See your ranking position immediately
• **Pro:** Featured placements go live
• **Power:** Lead capture form activates

**📈 Week 1 Results:**
• **Starter:** Logo and enhanced profile boost credibility
• **Pro:** Increased visibility from featured placements
• **Power:** First leads typically arrive

**🚀 Month 1 Results:**
• **Starter:** Ranking improvements from SEO backlink
• **Pro:** Review responses build customer trust
• **Power:** Lead flow stabilizes (15-20 average)

**📊 Factors Affecting Results:**
• Profile completeness (fill everything out!)
• Review quantity and quality
• Response time to inquiries
• Market competition level
• Service area size

**💡 Pro Tip:** Complete your profile 100% to see results 2x faster.

**Next Step:** Upgrade now to start the clock on your success.`,
    icon: <Clock className="h-5 w-5" />,
    category: "features",
    priority: 10
  },
  {
    id: "cancel-anytime",
    question: "Can I downgrade or cancel anytime?",
    answer: `**Quick Answer:** Yes! No contracts, no penalties, complete flexibility.

**🆓 Our Flexibility Promise:**
• **No Long-Term Contracts** - Month-to-month billing
• **Cancel Anytime** - No questions asked
• **Instant Changes** - Upgrade immediately
• **Pro-Rated Billing** - Only pay for what you use
• **Keep Your Data** - Export everything anytime

**🔄 How It Works:**

**Upgrading:**
• Takes effect immediately
• Pro-rated for current month
• New features activate instantly

**Downgrading:**
• Takes effect next billing cycle
• Keep current features until then
• No loss of historical data

**Canceling:**
• Cancel anytime from dashboard
• Keep access until period ends
• Free tier remains available

**💳 Annual Plans:**
• Save 25% with annual billing
• Same flexibility maintained
• Pro-rated refunds if needed

**👍 Why We Do This:**
We believe in earning your business every month through value, not contracts.

**Next Step:** Try any plan risk-free today.`,
    icon: <Shield className="h-5 w-5" />,
    category: "pricing",
    priority: 11
  },
  {
    id: "best-businesses",
    question: "What kind of businesses succeed most on AZ Business?",
    answer: `**Quick Answer:** Service businesses that value quality customers over quantity thrive on our platform.

**🌟 Top Performing Categories:**

**Home Services:**
• HVAC contractors
• Plumbers
• Electricians
• Landscapers
• Pool services
• *Average ROI: 8-12x monthly investment*

**Professional Services:**
• Real estate agents
• Insurance agents
• Financial advisors
• Lawyers
• Accountants
• *Average ROI: 10-15x monthly investment*

**Health & Wellness:**
• Dentists
• Chiropractors
• Therapists
• Personal trainers
• Med spas
• *Average ROI: 12-20x monthly investment*

**📊 Success Factors:**
• **Response Time:** Reply to leads within 1 hour
• **Profile Quality:** 100% complete with photos
• **Review Management:** Actively respond to reviews
• **Service Area:** Cover 2-3 cities minimum
• **Pricing Transparency:** Clear service information

**💡 Ideal Customer Profile:**
• Established 2+ years
• Good online reviews (4.0+)
• Professional service focus
• Values quality over quantity

**Next Step:** See how businesses like yours are succeeding.`,
    icon: <Award className="h-5 w-5" />,
    category: "features",
    priority: 12
  },
  {
    id: "ai-ranking",
    question: "How does the AI ranking system work?",
    answer: `**Quick Answer:** Our AI analyzes multiple quality signals to rank businesses fairly, not just who pays most.

**🤖 Ranking Factors (Weighted):**

**Customer Satisfaction (40%):**
• Review ratings and recency
• Review response rate
• Sentiment analysis
• Customer retention signals

**Business Quality (30%):**
• Profile completeness
• Verification status
• Service descriptions
• Professional presentation

**Engagement Metrics (20%):**
• Response time to inquiries
• Profile views to contact ratio
• Customer interactions
• Update frequency

**Local Relevance (10%):**
• Service area match
• Local review quantity
• Community involvement
• Years in business

**📈 How Rankings Update:**
• Real-time adjustments for major changes
• Daily recalculation for all businesses
• Weekly trend analysis
• Monthly comprehensive review

**💡 Key Insights:**
• **Free tier:** Competes but can't see position
• **Starter+:** See exact ranking position
• **Quality wins:** Best businesses rise regardless of tier
• **No pay-to-win:** Can't buy top position

**Next Step:** Claim your listing to start building ranking signals.`,
    icon: <Brain className="h-5 w-5" />,
    category: "features",
    priority: 13
  },
  {
    id: "support-options",
    question: "What support do you provide for new businesses?",
    answer: `**Quick Answer:** From free resources to priority support, we help businesses at every stage succeed.

**🆓 FREE - Community Support**
• Help documentation
• Video tutorials
• Community forum
• Email support (48hr response)

**🚀 STARTER - Enhanced Support**
• Everything in Free PLUS:
• Profile optimization guide
• Ranking improvement tips
• Email support (24hr response)

**🌟 PRO - Professional Support**
• Everything in Starter PLUS:
• Monthly performance review
• Competitive insights report
• Priority email (12hr response)

**⚡ POWER - Priority Support**
• Everything in Pro PLUS:
• Dedicated account success manager
• Phone support available
• Lead conversion coaching
• Custom growth strategies
• Same-day response guarantee

**🎆 Onboarding Support (All Paid Tiers):**
• Welcome call within 24 hours
• Profile setup assistance
• Best practices training
• 30-day check-in call

**Next Step:** Start with the support level that matches your needs.`,
    icon: <Users className="h-5 w-5" />,
    category: "support",
    priority: 14
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
                    isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="border-t border-prickly-pear-pink/30 pt-4">
                      <div className="text-ironwood-charcoal/70 leading-relaxed space-y-3">
                        {item.answer.split('\n\n').map((paragraph, index) => {
                          // Handle bullet points
                          if (paragraph.includes('•')) {
                            const lines = paragraph.split('\n');
                            return (
                              <div key={index} className="space-y-1">
                                {lines.map((line, lineIndex) => {
                                  if (line.trim().startsWith('•')) {
                                    return (
                                      <div key={lineIndex} className="flex items-start ml-4">
                                        <span className="text-ocotillo-red mr-2 flex-shrink-0">•</span>
                                        <span dangerouslySetInnerHTML={{ 
                                          __html: line.replace(/•\s*/, '')
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                        }} />
                                      </div>
                                    );
                                  } else if (line.trim()) {
                                    return (
                                      <div key={lineIndex} dangerouslySetInnerHTML={{ 
                                        __html: line
                                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                      }} />
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            );
                          }
                          
                          // Handle numbered lists
                          if (/^\d+\./.test(paragraph)) {
                            return (
                              <ol key={index} className="space-y-1 ml-6 list-decimal">
                                {paragraph.split('\n').map((line, lineIndex) => (
                                  <li key={lineIndex} dangerouslySetInnerHTML={{ 
                                    __html: line.replace(/^\d+\.\s*/, '')
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  }} />
                                ))}
                              </ol>
                            );
                          }
                          
                          // Regular paragraphs with markdown
                          return (
                            <p key={index} dangerouslySetInnerHTML={{ 
                              __html: paragraph
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
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
            Ready to grow your Arizona business?
          </h3>
          <p className="text-lg text-ironwood-charcoal/80 mb-6 max-w-2xl mx-auto">
            Join 500+ Arizona businesses already saving money and generating more leads with predictable pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/add-business"
              className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg"
            >
              <Award className="mr-2 h-5 w-5" />
              Claim Your Free Listing
            </a>
            <a 
              href="/pricing"
              className="inline-flex items-center px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all font-medium"
            >
              Compare All Plans
            </a>
          </div>
          <p className="text-sm text-ironwood-charcoal/60 mt-4">
            No credit card required • 2-minute setup • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}