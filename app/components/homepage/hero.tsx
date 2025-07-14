import { Button } from "~/components/ui/button";
import SearchWidget from "./search-widget";

export default function HeroSection() {

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sandstone via-clay-beige/20 to-background pt-32 pb-16">
      {/* Desert wave pattern background */}
      <div className="absolute inset-0 -z-10">
        <svg
          className="absolute bottom-0 left-0 right-0 text-clay-beige/30"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="currentColor"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,133.3C672,139,768,181,864,197.3C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
        {/* Subtle topographic lines */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
            <defs>
              <pattern id="topographic" patternUnits="userSpaceOnUse" width="100" height="100">
                <path d="M0,50 Q25,25 50,50 T100,50" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-mesa-terracotta"/>
                <path d="M0,25 Q25,0 50,25 T100,25" stroke="currentColor" strokeWidth="0.3" fill="none" className="text-agave-green"/>
                <path d="M0,75 Q25,50 50,75 T100,75" stroke="currentColor" strokeWidth="0.3" fill="none" className="text-saguaro-teal"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topographic)"/>
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-desert-night">
            Find Trusted <span className="text-saguaro-teal">Service</span> Pros Across Arizona
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Verified & Reviewed local service providers ready to help with your home and business needs
          </p>

          {/* Search Widget */}
          <div className="mt-10">
            <SearchWidget />
          </div>

          {/* Quick Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="text-sm text-muted-foreground">Popular:</span>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <a href="/hvac-services">HVAC Services</a>
            </Button>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <a href="/plumbing">Plumbing</a>
            </Button>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <a href="/electrical">Electrical</a>
            </Button>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <a href="/city/phoenix">Phoenix</a>
            </Button>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <a href="/city/mesa">Mesa</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}