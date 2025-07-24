import React from 'react';
import { Card } from '~/components/ui/card';

interface AIInsightsTableProps {
  className?: string;
}

export const AIInsightsTable: React.FC<AIInsightsTableProps> = ({ className }) => {
  const highlightMetrics = (text: string) => {
    return text.replace(/(\d+%)/g, '<span class="font-semibold text-ocotillo-red">$1</span>')
               .replace(/(\d+ minutes)/g, '<span class="font-semibold text-ocotillo-red">$1</span>')
               .replace(/(#\d+)/g, '<span class="font-semibold text-ocotillo-red">$1</span>');
  };
  
  const categories = [
    {
      category: "What Customers Say Most",
      analysis: {
        title: "Direct Customer Feedback:",
        points: [
          "\"They arrive quickly and fix things right the first time\"",
          "\"Professional technicians who explain everything clearly\"",
          "\"Fair pricing with no surprise charges\"",
          "\"Reliable service you can count on during emergencies\""
        ]
      }
    },
    {
      category: "Speed & Availability",
      analysis: {
        title: "Response Excellence:",
        mainPoint: "\"Quick response\" mentioned in <strong class=\"text-ocotillo-red\">78%</strong> of reviews",
        details: [
          "Shows up within promised window 94% of the time",
          "Emergency calls answered in average 12 minutes"
        ]
      }
    },
    {
      category: "Quality & Expertise",
      analysis: {
        title: "First-Visit Success:",
        mainPoint: "\"Fixed it right the first time\" mentioned in 67% of reviews",
        details: [
          "Only 8% mention return visits needed",
          "96% satisfaction for complex projects"
        ],
        subTitle: "Professional Service:",
        subPoint: "\"Explains everything clearly\" appears in 84% of reviews",
        subDetails: [
          "\"Professional technicians\" highlighted by 94% of customers",
          "Proactive updates mentioned in 45% of reviews"
        ]
      }
    },
    {
      category: "Communication & Service",
      analysis: {
        title: "Professional Service:",
        mainPoint: "\"Explains everything clearly\" appears in 84% of reviews",
        details: [
          "\"Professional technicians\" highlighted by 94% of customers",
          "Proactive updates mentioned in 45% of reviews"
        ]
      }
    },
    {
      category: "Pricing & Value",
      analysis: {
        title: "Transparent Pricing:",
        mainPoint: "\"Fair pricing\" noted by 89% of customers",
        details: [
          "\"No surprise charges\" mentioned in 23% of reviews",
          "Price complaints appear in only 6% of feedback"
        ]
      }
    },
    {
      category: "Trust & Reliability",
      analysis: {
        title: "Consistent Performance:",
        mainPoint: "4.8/5 average maintained over 18+ months",
        details: [
          "\"Reliable service\" mentioned in 73% of reviews",
          "Customer retention pattern shows 89% call them back"
        ]
      }
    }
  ];

  return (
    <Card className={`bg-white border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-ironwood-charcoal text-white">
              <th className="text-left p-3 font-semibold text-sm w-1/3">
                Category
              </th>
              <th className="text-left p-3 font-semibold text-sm w-2/3">
                What AI Discovered
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((item, index) => (
              <tr 
                key={index} 
                className={`${index !== categories.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <td className="p-3 font-semibold text-sm align-top border-r border-gray-200 bg-agave-cream/20">
                  {item.category}
                </td>
                <td className="p-3 text-sm align-top">
                  <div className="space-y-2">
                    {item.category === "What Customers Say Most" ? (
                      <>
                        <div>
                          <span className="font-medium text-ironwood-charcoal text-xs">{item.analysis.title}</span>
                          <span className="text-gray-600 text-xs"> {item.analysis.points.join(" • ")}</span>
                        </div>
                      </>
                    ) : item.category === "Quality & Expertise" ? (
                      <>
                        <div>
                          <span className="font-medium text-ironwood-charcoal text-xs">{item.analysis.title}</span>
                          <span className="text-gray-600 text-xs" dangerouslySetInnerHTML={{ __html: " " + highlightMetrics(item.analysis.mainPoint) }}></span>
                          {item.analysis.details && (
                            <span className="text-gray-600 text-xs" dangerouslySetInnerHTML={{ __html: " • " + item.analysis.details.map(d => highlightMetrics(d)).join(" • ") }}></span>
                          )}
                        </div>
                        {item.analysis.subTitle && (
                          <div className="pt-1">
                            <span className="font-medium text-ironwood-charcoal text-xs">{item.analysis.subTitle}</span>
                            <span className="text-gray-600 text-xs" dangerouslySetInnerHTML={{ __html: " " + highlightMetrics(item.analysis.subPoint) }}></span>
                            {item.analysis.subDetails && (
                              <span className="text-gray-600 text-xs" dangerouslySetInnerHTML={{ __html: " • " + item.analysis.subDetails.map(d => highlightMetrics(d)).join(" • ") }}></span>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        <span className="font-medium text-ironwood-charcoal text-xs">{item.analysis.title}</span>
                        <span className="text-gray-600 text-xs" dangerouslySetInnerHTML={{ __html: " " + highlightMetrics(item.analysis.mainPoint) }}></span>
                        {item.analysis.details && (
                          <span className="text-gray-600 text-xs"> • {item.analysis.details.join(" • ")}</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};