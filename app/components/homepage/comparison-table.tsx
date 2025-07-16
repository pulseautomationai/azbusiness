import { DollarSign, Target, MapPin, Brain, Shield, Award } from "lucide-react";

export default function ComparisonTable() {
  return (
    <section className="py-16 bg-agave-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Comparison Table Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-ironwood-charcoal mb-4">
              Why Arizona Businesses Choose Us Over Lead Generation Platforms
            </h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[30%]" />
                  <col className="w-[35%]" />
                  <col className="w-[35%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Feature
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Thumbtack/Angi
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      AZ Business Directory
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-[#E36450] mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Pricing Model</div>
                          <div className="text-xs text-gray-500">Cost structure</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-gray-500">
                      $80-100 per shared lead
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-green-600 font-medium">
                      $97/month unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 text-[#E36450] mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Lead Exclusivity</div>
                          <div className="text-xs text-gray-500">Customer sharing</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-gray-500">
                      Shared with 3-5 contractors
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-green-600 font-medium">
                      Exclusive to your business
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-[#E36450] mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Professional Directory</div>
                          <div className="text-xs text-gray-500">Business presence</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-gray-500">
                      Basic contractor profile
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-green-600 font-medium">
                      Enhanced Arizona visibility
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        <Brain className="w-4 h-4 text-[#E36450] mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">AI Enhancement</div>
                          <div className="text-xs text-gray-500">Intelligent features</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-gray-500">
                      None
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-green-600 font-medium">
                      AI-powered presentation
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-[#E36450] mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Professional Presentation</div>
                          <div className="text-xs text-gray-500">Trust building</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-gray-500">
                      Basic listing only
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-green-600 font-medium">
                      Enhanced business profiles
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-[#E36450] mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Local Focus</div>
                          <div className="text-xs text-gray-500">Arizona specialization</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-gray-500">
                      National platform
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-green-600 font-medium">
                      Arizona-focused directory
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}