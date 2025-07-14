import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";

const POPULAR_SERVICES = [
  "HVAC Services", "Plumbing", "Electrical", "Roofing", "Landscaping", 
  "Pest Control", "Carpet Cleaning", "Auto Repair", "Photography"
];

const ARIZONA_ZIPCODES = [
  "85001", "85003", "85004", "85006", "85007", "85008", "85009", "85013",
  "85014", "85015", "85016", "85017", "85018", "85019", "85020", "85021",
  "85022", "85023", "85024", "85026", "85027", "85028", "85029", "85032",
  "85033", "85034", "85035", "85037", "85040", "85041", "85042", "85043",
  "85044", "85045", "85048", "85050", "85051", "85053", "85054", "85083",
  "85201", "85202", "85203", "85204", "85205", "85206", "85207", "85208",
  "85209", "85210", "85212", "85213", "85215", "85224", "85225", "85226",
  "85233", "85234", "85236", "85248", "85249", "85250", "85251", "85253",
  "85254", "85255", "85256", "85257", "85258", "85259", "85260", "85262",
  "85263", "85264", "85266", "85268", "85269", "85281", "85282", "85283",
  "85284", "85295", "85296", "85297", "85298", "85299", "85301", "85302",
  "85303", "85304", "85305", "85306", "85307", "85308", "85309", "85310",
  "85318", "85323", "85326", "85331", "85335", "85338", "85339", "85340",
  "85342", "85345", "85351", "85353", "85354", "85355", "85374", "85375",
  "85379", "85381", "85382", "85383", "85387", "85388", "85392", "85395",
  "85396", "86001", "86003", "86004", "86011", "86015", "86016", "86017",
  "86018", "86020", "86022", "86023", "86024", "86025", "86028", "86029",
  "86030", "86031", "86032", "86033", "86034", "86035", "86036", "86040",
  "86042", "86043", "86044", "86045", "86046", "86047", "86052", "86053",
  "86054", "86301", "86302", "86303", "86305", "86312", "86313", "86314",
  "86320", "86321", "86322", "86323", "86324", "86325", "86326", "86327",
  "86329", "86331", "86332", "86333", "86334", "86335", "86336", "86337",
  "86338", "86339", "86342", "86343", "86351", "86401", "86402", "86403",
  "86404", "86405", "86406", "86409", "86411", "86412", "86413", "86426",
  "86427", "86429", "86430", "86431", "86432", "86433", "86434", "86435",
  "86436", "86437", "86438", "86440", "86441", "86442", "86443", "86444",
  "86445", "86502", "86503", "86504", "86505", "86506", "86507", "86508",
  "86510", "86511", "86512", "86513", "86514", "86515", "86520", "86535",
  "86538", "86540", "86544", "86545", "86547", "86556"
];

export default function SearchWidget() {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [showZipcodeSuggestions, setShowZipcodeSuggestions] = useState(false);

  const filteredServices = POPULAR_SERVICES.filter(s => 
    s.toLowerCase().includes(service.toLowerCase())
  ).slice(0, 6);

  const filteredZipcodes = ARIZONA_ZIPCODES.filter(z => 
    z.startsWith(zipcode)
  ).slice(0, 8);

  const validateZipcode = (zip: string): boolean => {
    return ARIZONA_ZIPCODES.includes(zip);
  };

  const handleSearch = () => {
    if (!service.trim()) {
      return;
    }

    if (zipcode && !validateZipcode(zipcode)) {
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set('service', service.trim());
    
    if (zipcode) {
      searchParams.set('zipcode', zipcode);
    }

    navigate(`/search?${searchParams.toString()}`);
  };

  const handleServiceSelect = (selectedService: string) => {
    setService(selectedService);
    setShowServiceSuggestions(false);
  };

  const handleZipcodeSelect = (selectedZipcode: string) => {
    setZipcode(selectedZipcode);
    setShowZipcodeSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative bg-agave-cream">
      {/* Subtle desert background texture */}
      <div className="absolute inset-0 overflow-hidden opacity-3">
        <svg
          className="absolute top-4 left-8 w-24 h-16 text-prickly-pear-pink"
          viewBox="0 0 100 60"
          fill="currentColor"
        >
          {/* Soft wave/sand dune pattern */}
          <path d="M0 40 Q25 20 50 35 T100 30 L100 60 L0 60 Z" />
        </svg>
        <svg
          className="absolute top-8 right-12 w-20 h-12 text-cholla-green"
          viewBox="0 0 80 48"
          fill="currentColor"
        >
          {/* Gentle rolling hills */}
          <path d="M0 35 Q20 25 40 30 Q60 35 80 25 L80 48 L0 48 Z" />
        </svg>
        <svg
          className="absolute bottom-6 left-1/4 w-16 h-10 text-desert-sky-blue"
          viewBox="0 0 64 40"
          fill="currentColor"
        >
          {/* Soft abstract shape */}
          <ellipse cx="32" cy="20" rx="28" ry="12" />
        </svg>
      </div>

      <div className="relative space-y-6">

        <div className="flex flex-col gap-4 md:flex-row max-w-3xl mx-auto">
          {/* Service Input */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cholla-green" />
              <Input
                type="text"
                placeholder="What service do you need?"
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  setShowServiceSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowServiceSuggestions(service.length > 0)}
                onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 200)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-4 py-3 text-base bg-white border-desert-sky-blue focus:ring-2 focus:ring-ocotillo-red focus:border-ocotillo-red rounded-lg focus-ring-enhanced"
              />
            </div>
            
            {/* Service Suggestions */}
            {showServiceSuggestions && filteredServices.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredServices.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    onMouseDown={() => handleServiceSelect(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zipcode Input */}
          <div className="relative md:w-48">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cholla-green" />
              <Input
                type="text"
                placeholder="ZIP Code"
                value={zipcode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setZipcode(value);
                  setShowZipcodeSuggestions(value.length > 0);
                }}
                onFocus={() => setShowZipcodeSuggestions(zipcode.length > 0)}
                onBlur={() => setTimeout(() => setShowZipcodeSuggestions(false), 200)}
                onKeyPress={handleKeyPress}
                className={`pl-10 pr-4 py-3 text-base bg-white border-desert-sky-blue focus:ring-2 focus:ring-ocotillo-red focus:border-ocotillo-red rounded-lg focus-ring-enhanced ${
                  zipcode && !validateZipcode(zipcode) ? 'border-red-300' : ''
                }`}
                maxLength={5}
              />
            </div>

            {/* Zipcode Suggestions */}
            {showZipcodeSuggestions && filteredZipcodes.length > 0 && zipcode.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredZipcodes.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none font-mono"
                    onMouseDown={() => handleZipcodeSelect(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch} 
            size="lg"
            className="md:w-auto px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md rounded-full animate-glow-hover animate-button-press"
            disabled={!service.trim() || (zipcode.length > 0 && !validateZipcode(zipcode))}
          >
            Find Providers
          </Button>
        </div>

        {/* Validation Message */}
        {zipcode && !validateZipcode(zipcode) && (
          <p className="text-sm text-red-600 text-center">
            Please enter a valid Arizona ZIP code
          </p>
        )}

        {/* Popular Service + City Combinations */}
        <div className="flex flex-wrap justify-center items-center gap-3 pt-6 max-w-4xl mx-auto popular-links-mobile">
          <span className="text-sm font-medium text-ironwood-charcoal/80 mr-2">Popular:</span>
          <a 
            href="/hvac-services/phoenix"
            className="popular-link-pill inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-ironwood-charcoal bg-white/80 border border-prickly-pear-pink/30 hover:bg-ocotillo-red hover:text-white hover:border-ocotillo-red shadow-sm hover:shadow-md"
          >
            HVAC in Phoenix
          </a>
          <a 
            href="/plumbing/mesa"
            className="popular-link-pill inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-ironwood-charcoal bg-white/80 border border-prickly-pear-pink/30 hover:bg-ocotillo-red hover:text-white hover:border-ocotillo-red shadow-sm hover:shadow-md"
          >
            Plumbing in Mesa
          </a>
          <a 
            href="/electrical/chandler"
            className="popular-link-pill inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-ironwood-charcoal bg-white/80 border border-prickly-pear-pink/30 hover:bg-ocotillo-red hover:text-white hover:border-ocotillo-red shadow-sm hover:shadow-md"
          >
            Electricians in Chandler
          </a>
          <a 
            href="/roofing-gutters/scottsdale"
            className="popular-link-pill inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-ironwood-charcoal bg-white/80 border border-prickly-pear-pink/30 hover:bg-ocotillo-red hover:text-white hover:border-ocotillo-red shadow-sm hover:shadow-md"
          >
            Roofing in Scottsdale
          </a>
          <a 
            href="/landscaping/tempe"
            className="popular-link-pill inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-ironwood-charcoal bg-white/80 border border-prickly-pear-pink/30 hover:bg-ocotillo-red hover:text-white hover:border-ocotillo-red shadow-sm hover:shadow-md"
          >
            Landscaping in Tempe
          </a>
        </div>
      </div>
    </div>
  );
}