import { Button } from "~/components/ui/button";
import SearchWidget from "./search-widget";

export default function HeroSection() {

  return (
    <section className="relative bg-agave-cream pt-44 pb-20 overflow-hidden">
      {/* Subtle Desert Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="absolute top-10 left-10 w-32 h-32 text-ironwood-charcoal"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          {/* Saguaro Cactus Silhouette */}
          <path d="M45 90 L45 35 Q45 30 50 30 Q55 30 55 35 L55 50 L70 50 Q75 50 75 45 Q75 40 70 40 L70 20 Q70 15 65 15 Q60 15 60 20 L60 40 L55 40 L55 35 L55 90 M30 90 L30 65 Q30 60 35 60 Q40 60 40 65 L40 90 M45 35 L30 35 Q25 35 25 30 Q25 25 30 25 L45 25" />
        </svg>
        
        <svg
          className="absolute top-20 right-20 w-24 h-24 text-prickly-pear-pink"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          {/* Mountain Range Silhouette */}
          <path d="M0 80 L20 40 L35 55 L50 25 L65 45 L80 30 L100 50 L100 80 Z" />
        </svg>

        <svg
          className="absolute bottom-10 left-1/4 w-20 h-20 text-cholla-green"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          {/* Agave Plant Silhouette */}
          <path d="M50 50 L30 30 Q25 25 30 20 Q35 25 50 40 L70 30 Q75 25 70 20 Q65 25 50 40 L60 70 Q65 75 60 80 Q55 75 50 60 L40 70 Q35 75 40 80 Q45 75 50 60 Z" />
        </svg>

        <svg
          className="absolute bottom-20 right-1/3 w-16 h-16 text-desert-sky-blue"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          {/* Sun Rays */}
          <circle cx="50" cy="50" r="8" />
          <path d="M50 10 L50 25 M50 75 L50 90 M10 50 L25 50 M75 50 L90 50 M21.5 21.5 L32.5 32.5 M67.5 32.5 L78.5 21.5 M21.5 78.5 L32.5 67.5 M67.5 67.5 L78.5 78.5" strokeWidth="3" stroke="currentColor" fill="none" />
        </svg>
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-agave-cream via-transparent to-agave-cream/50"></div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-6xl font-medium text-ironwood-charcoal mb-6 relative">
            Arizona's Most Trusted <span className="text-ocotillo-red">Local Pros</span> — All in One Place
            {/* Subtle text shadow for depth */}
            <div className="absolute inset-0 font-serif text-5xl md:text-6xl lg:text-6xl font-medium text-ocotillo-red/5 translate-x-1 translate-y-1 -z-10">
              Arizona's Most Trusted Local Pros — All in One Place
            </div>
          </h1>
          <p className="text-lg text-ironwood-charcoal/80 mb-12 relative z-10">
            Verified, reviewed, and ready to help — connect instantly with top-rated service providers near you.
          </p>

          {/* Integrated Search Widget */}
          <div className="mt-8 relative z-10">
            <SearchWidget />
          </div>
        </div>
      </div>
    </section>
  );
}