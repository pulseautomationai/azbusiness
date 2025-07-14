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
    <Card className="p-6 shadow-lg bg-cloud-white border-clay-beige hover:shadow-xl transition-shadow duration-300">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-desert-night mb-2">
            Find Trusted Service Providers
          </h2>
          <p className="text-sm text-muted-foreground">
            Get matched with verified professionals in your area
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          {/* Service Input */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-agave-green" />
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
                className="pl-10 pr-4 py-3 text-base"
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
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-agave-green" />
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
                className={`pl-10 pr-4 py-3 text-base ${
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
            className="md:w-auto px-8 py-3"
            disabled={!service.trim() || (zipcode && !validateZipcode(zipcode))}
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

        {/* Popular Services */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <span className="text-sm text-muted-foreground">Popular:</span>
          {POPULAR_SERVICES.slice(0, 5).map((popularService) => (
            <Button
              key={popularService}
              variant="link"
              size="sm"
              className="h-auto p-0 text-sm"
              onClick={() => handleServiceSelect(popularService)}
            >
              {popularService}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}