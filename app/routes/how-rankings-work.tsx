import { type MetaFunction } from "react-router";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Header } from "~/components/homepage/header";
import Footer from "~/components/homepage/footer";

export const meta: MetaFunction = () => {
  return [
    { title: "How Rankings Work | AZ Business Services" },
    {
      name: "description",
      content: "Discover how AZ Business Services uses AI to identify Arizona's highest-quality service providers based on real customer experiences and merit-based performance.",
    },
  ];
};

export default function HowRankingsWork() {
  return (
    <div className="min-h-screen bg-agave-cream">
      <Header />
      
      {/* Hero Section - Clean, centered */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-ironwood-charcoal leading-tight mb-6">
            How Do Rankings Work?
          </h1>
          <p className="text-lg md:text-xl text-ironwood-charcoal mb-10 max-w-2xl mx-auto">
            Discover how we use AI to identify Arizona's highest-quality service providers based on what customers actually say
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-ocotillo-red text-white hover:bg-ocotillo-red-hover font-semibold px-8 w-full sm:w-auto"
            >
              <Link to="/categories">
                Browse Top Businesses
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-desert-marigold text-white hover:bg-desert-marigold-hover font-semibold px-8 w-full sm:w-auto"
            >
              <Link to="/claim-listing">
                Claim Your Listing
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <hr className="w-16 border-turquoise-sky mx-auto my-12" />

      {/* Core Philosophy - Icon-left layout */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair text-ironwood-charcoal text-center mb-16">
            ❤️ Core Philosophy
          </h2>
          
          <div className="space-y-12">
            {/* Philosophy 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-turquoise-sky/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚖️</span>
              </div>
              <div>
                <h3 className="text-xl font-playfair text-ironwood-charcoal mb-2">
                  Quality AND Quantity Matter
                </h3>
                <p className="text-ironwood-charcoal leading-relaxed">
                  We analyze both the excellence of service AND the consistency of performance over time. 
                  A business with consistently great service across many customers will outrank one with just a few reviews, 
                  but excellence is rewarded over mediocre volume.
                </p>
              </div>
            </div>

            {/* Philosophy 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-turquoise-sky/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-playfair text-ironwood-charcoal mb-2">
                  Merit-Based Rankings
                </h3>
                <p className="text-ironwood-charcoal leading-relaxed">
                  Your ranking position is earned through demonstrated service excellence, not through advertising spend. 
                  Businesses rise to the top by consistently delivering outstanding customer experiences across multiple jobs.
                </p>
              </div>
            </div>

            {/* Philosophy 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-turquoise-sky/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-playfair text-ironwood-charcoal mb-2">
                  AI-Powered Analysis
                </h3>
                <p className="text-ironwood-charcoal leading-relaxed">
                  Our advanced AI analyzes what customers actually say in their reviews, 
                  identifying specific patterns of service excellence that simple star ratings miss.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="w-16 border-turquoise-sky mx-auto my-12" />

      {/* Ranking System Overview - Two column layout */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair text-ironwood-charcoal mb-6">
                🧠 How Our AI Ranking System Works
              </h2>
              <p className="text-lg text-ironwood-charcoal mb-4">
                Advanced Review Intelligence
              </p>
              <p className="text-ironwood-charcoal leading-relaxed">
                Our AI reads and analyzes every customer review to identify specific markers of service excellence.
                We go beyond simple star ratings to understand the true quality of service delivered.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-turquoise-sky pl-6">
                <h4 className="text-lg font-playfair text-ironwood-charcoal mb-2">
                  🔍 Deep Text Analysis
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  We analyze the actual language customers use to describe their experiences, 
                  looking beyond simple star ratings to understand the quality of service delivered.
                </p>
              </div>
              
              <div className="border-l-4 border-turquoise-sky pl-6">
                <h4 className="text-lg font-playfair text-ironwood-charcoal mb-2">
                  📊 Pattern Recognition
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Our system identifies consistent patterns of excellence across multiple reviews, 
                  recognizing when businesses repeatedly deliver exceptional service.
                </p>
              </div>
              
              <div className="border-l-4 border-turquoise-sky pl-6">
                <h4 className="text-lg font-playfair text-ironwood-charcoal mb-2">
                  ⚡ Real-Time Updates
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Rankings are continuously updated as new reviews are analyzed, 
                  ensuring our rankings reflect current service quality and performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Break */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl md:text-2xl font-playfair italic text-ocotillo-red">
            "3 excellent reviews from delighted customers outrank 50 mediocre ones"
          </p>
        </div>
      </section>

      {/* Six Quality Categories - Asymmetrical grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair text-ironwood-charcoal text-center mb-4">
            🏆 The Six Quality Categories
          </h2>
          <p className="text-lg md:text-xl text-ironwood-charcoal text-center mb-12">
            Every business is evaluated across these key areas of service excellence
          </p>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* High Priority Group */}
            <div className="space-y-6">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded bg-ocotillo-red/10 text-ocotillo-red uppercase tracking-wide">
                High Priority
              </span>
              
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-desert-marigold">
                <h4 className="text-xl font-playfair text-ironwood-charcoal mb-3">
                  ⭐ Quality Indicators
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Measures excellence, precision, and getting it right the first time.
                  Includes exceeding expectations, attention to detail, and precision workmanship.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-desert-marigold">
                <h4 className="text-xl font-playfair text-ironwood-charcoal mb-3">
                  🎯 Service Excellence
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Evaluates professionalism, communication, and expertise.
                  Professional demeanor, clear communication, and knowledge sharing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-desert-marigold">
                <h4 className="text-xl font-playfair text-ironwood-charcoal mb-3">
                  ❤️ Customer Experience
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Focuses on emotional impact and customer satisfaction.
                  Trust building, stress relief, and relationship development.
                </p>
              </div>
            </div>

            {/* Medium Priority Group */}
            <div className="space-y-6">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded bg-desert-marigold/10 text-desert-marigold uppercase tracking-wide">
                Medium Priority
              </span>
              
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-turquoise-sky">
                <h4 className="text-xl font-playfair text-ironwood-charcoal mb-3">
                  🔧 Technical Mastery
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Assesses problem-solving ability and technical competency.
                  Complex solutions and fixing what others couldn't.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-turquoise-sky">
                <h4 className="text-xl font-playfair text-ironwood-charcoal mb-3">
                  🏆 Competitive Advantage
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Identifies market leadership and differentiation.
                  "Better than others" mentions and local favorite status.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-turquoise-sky">
                <h4 className="text-xl font-playfair text-ironwood-charcoal mb-3">
                  ⚡ Operational Excellence
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Measures speed, reliability, and value delivery.
                  Fast response times and emergency availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="w-16 border-turquoise-sky mx-auto my-12" />

      {/* How We're Different - Side by side comparison */}
      <section className="py-24 xl:mt-32 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair text-ironwood-charcoal text-center mb-12">
            ⚖️ How We're Different
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 md:p-8 rounded-lg border-2 border-ocotillo-red">
              <h3 className="text-xl md:text-2xl font-playfair text-ironwood-charcoal mb-6">
                AZ Business Services
              </h3>
              <p className="text-sm font-semibold text-ocotillo-red mb-4">Merit-Based Rankings</p>
              <ul className="list-disc list-inside space-y-3 text-ironwood-charcoal">
                <li>AI analyzes service quality</li>
                <li>Rankings based on performance</li>
                <li>Quality AND quantity focus</li>
                <li>Transparent methodology</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 md:p-8 rounded-lg border-2 border-gray-300">
              <h3 className="text-xl md:text-2xl font-playfair text-gray-600 mb-6">
                Traditional Directories
              </h3>
              <p className="text-sm font-semibold text-gray-500 mb-4">Pay-to-Play Systems</p>
              <ul className="list-disc list-inside space-y-3 text-gray-600">
                <li>Rankings based on ad spend</li>
                <li>Simple star averages</li>
                <li>Volume over quality focus</li>
                <li>Opaque ranking factors</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Handling - Horizontal scroll */}
      <section className="py-24 xl:mt-32 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair text-ironwood-charcoal text-center mb-4">
            🏗 Industry Patterns We Recognize
          </h2>
          <p className="text-lg md:text-xl text-ironwood-charcoal text-center mb-12">
            Our algorithm adapts to different service types
          </p>

          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 w-max">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 w-80 flex-shrink-0">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded bg-turquoise-sky/10 text-turquoise-sky uppercase tracking-wide mb-4">
                  HIGH VOLUME
                </span>
                <h3 className="text-lg font-playfair text-ironwood-charcoal mb-3">
                  Routine Services
                </h3>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Cleaning, maintenance, and regular services naturally generate more frequent reviews. 
                  We expect higher review counts for ranking confidence.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 w-80 flex-shrink-0">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded bg-turquoise-sky/10 text-turquoise-sky uppercase tracking-wide mb-4">
                  SPECIALIZED
                </span>
                <h3 className="text-lg font-playfair text-ironwood-charcoal mb-3">
                  Complex Services
                </h3>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Emergency repairs and specialized trades often have fewer but more detailed reviews. 
                  We adjust minimum volume requirements accordingly.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 w-80 flex-shrink-0">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded bg-turquoise-sky/10 text-turquoise-sky uppercase tracking-wide mb-4">
                  SEASONAL
                </span>
                <h3 className="text-lg font-playfair text-ironwood-charcoal mb-3">
                  Cyclical Businesses
                </h3>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Landscaping and pool services have cyclical review patterns. 
                  Our system accounts for these natural fluctuations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 w-80 flex-shrink-0">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded bg-turquoise-sky/10 text-turquoise-sky uppercase tracking-wide mb-4">
                  QUALITY FOCUSED
                </span>
                <h3 className="text-lg font-playfair text-ironwood-charcoal mb-3">
                  Excellence Standards
                </h3>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  A plumber with 12 detailed excellence reviews may outrank a landscaper with 50 routine mixed reviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="w-16 border-turquoise-sky mx-auto my-12" />

      {/* Business Tips - Grid with numbers */}
      <section className="py-24 xl:mt-32 px-4 bg-turquoise-sky/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair text-ironwood-charcoal text-center mb-4">
            🚀 How to Improve Your Rankings
          </h2>
          <p className="text-lg md:text-xl text-ironwood-charcoal text-center mb-12">
            Focus on service excellence, and the rankings will follow
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Foundational Pillars - First two cards */}
            <div className="bg-white p-6 rounded-lg border-l-4 border-l-desert-marigold">
              <div className="w-10 h-10 bg-ocotillo-red text-white rounded-full flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-playfair text-xl text-ironwood-charcoal mb-2">
                Deliver Excellence Consistently
              </h3>
              <p className="text-sm text-ironwood-charcoal leading-relaxed">
                Focus on exceeding customer expectations on every job.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border-l-4 border-l-desert-marigold">
              <div className="w-10 h-10 bg-ocotillo-red text-white rounded-full flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-playfair text-xl text-ironwood-charcoal mb-2">
                Get It Right First Time
              </h3>
              <p className="text-sm text-ironwood-charcoal leading-relaxed">
                Precision work that doesn't require callbacks is highly valued.
              </p>
            </div>

            {/* Additional cards */}
            <div className="bg-white p-6 rounded-lg">
              <div className="w-10 h-10 bg-ocotillo-red text-white rounded-full flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-playfair text-xl text-ironwood-charcoal mb-2">
                Communicate Clearly
              </h3>
              <p className="text-sm text-ironwood-charcoal leading-relaxed">
                Keep customers informed and maintain professional communication.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <div className="w-10 h-10 bg-ocotillo-red text-white rounded-full flex items-center justify-center font-bold mb-4">
                4
              </div>
              <h3 className="font-playfair text-xl text-ironwood-charcoal mb-2">
                Build Relationships
              </h3>
              <p className="text-sm text-ironwood-charcoal leading-relaxed">
                Focus on trust and lasting relationships with customers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <div className="w-10 h-10 bg-ocotillo-red text-white rounded-full flex items-center justify-center font-bold mb-4">
                5
              </div>
              <h3 className="font-playfair text-xl text-ironwood-charcoal mb-2">
                Solve Complex Problems
              </h3>
              <p className="text-sm text-ironwood-charcoal leading-relaxed">
                Taking on challenging jobs demonstrates technical mastery.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <div className="w-10 h-10 bg-ocotillo-red text-white rounded-full flex items-center justify-center font-bold mb-4">
                6
              </div>
              <h3 className="font-playfair text-xl text-ironwood-charcoal mb-2">
                Respond Quickly
              </h3>
              <p className="text-sm text-ironwood-charcoal leading-relaxed">
                Fast response times demonstrate operational excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Section - Icon-left format */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair text-ironwood-charcoal text-center mb-12">
            🔍 Our Transparency Pledge
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-turquoise-sky/10 rounded-lg flex items-center justify-center mt-1">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h4 className="font-playfair text-lg text-ironwood-charcoal mb-1">
                  Open Methodology
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  We explain our ranking factors so businesses know what drives success and consumers understand what they're seeing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-turquoise-sky/10 rounded-lg flex items-center justify-center mt-1">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h4 className="font-playfair text-lg text-ironwood-charcoal mb-1">
                  AI-Powered Fairness
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  Our AI system eliminates human bias and ensures consistent evaluation across all businesses using the same quality standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-turquoise-sky/10 rounded-lg flex items-center justify-center mt-1">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h4 className="font-playfair text-lg text-ironwood-charcoal mb-1">
                  Continuous Improvement
                </h4>
                <p className="text-sm text-ironwood-charcoal leading-relaxed">
                  We regularly refine our algorithms to better identify service excellence and provide more accurate rankings for consumers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-ironwood-charcoal text-agave-cream">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair mb-6">
            See What Real Rankings Feel Like.
          </h2>
          <p className="text-xl md:text-2xl opacity-90 mb-2">
            2,198,142 reviews analyzed
          </p>
          <p className="text-lg md:text-xl opacity-80 mb-10">
            Experience the difference when rankings are based on real service excellence
          </p>
          <Button
            asChild
            size="lg"
            className="bg-ocotillo-red hover:bg-ocotillo-red-hover text-white font-semibold px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
          >
            <Link to="/categories">
              Explore Top-Ranked Businesses
            </Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}