/**
 * Category detection system for auto-categorizing businesses from CSV data
 */

export interface CategoryMapping {
  slug: string;
  name: string;
  keywords: string[];
  priority: number; // Higher number = higher priority for matching
}

export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    slug: 'hvac-services',
    name: 'HVAC Services',
    keywords: ['hvac', 'air conditioning', 'heating', 'cooling', 'ac repair', 'furnace', 'heat pump', 'ductwork', 'ventilation'],
    priority: 10
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    keywords: ['plumbing', 'plumber', 'pipe', 'drain', 'water heater', 'leak repair', 'sewer', 'faucet', 'toilet'],
    priority: 10
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    keywords: ['electrical', 'electrician', 'electric', 'wiring', 'circuit', 'outlet', 'breaker', 'panel', 'lighting'],
    priority: 10
  },
  {
    slug: 'cleaning-services',
    name: 'Cleaning Services',
    keywords: ['cleaning', 'cleaner', 'maid', 'housekeeping', 'janitorial', 'carpet cleaning', 'window cleaning', 'sanitize'],
    priority: 8
  },
  {
    slug: 'landscaping',
    name: 'Landscaping',
    keywords: ['landscaping', 'landscape', 'lawn', 'garden', 'yard', 'grass', 'irrigation', 'sprinkler', 'gardening'],
    priority: 8
  },
  {
    slug: 'handyman',
    name: 'Handyman',
    keywords: ['handyman', 'handymen', 'repair', 'maintenance', 'fix', 'general contractor', 'home repair'],
    priority: 7
  },
  {
    slug: 'pest-control',
    name: 'Pest Control',
    keywords: ['pest control', 'exterminator', 'termite', 'bug', 'rodent', 'ant', 'cockroach', 'spider', 'scorpion'],
    priority: 9
  },
  {
    slug: 'home-security',
    name: 'Home Security',
    keywords: ['security', 'alarm', 'surveillance', 'camera', 'monitoring', 'burglar', 'fire alarm', 'access control'],
    priority: 8
  },
  {
    slug: 'roofing-gutters',
    name: 'Roofing & Gutters',
    keywords: ['roofing', 'roof', 'gutter', 'shingle', 'tile', 'leak', 'repair', 'replacement', 'roofer'],
    priority: 9
  },
  {
    slug: 'flooring',
    name: 'Flooring',
    keywords: ['flooring', 'floor', 'carpet', 'tile', 'hardwood', 'vinyl', 'laminate', 'installation', 'refinishing'],
    priority: 8
  },
  {
    slug: 'painting',
    name: 'Painting',
    keywords: ['painting', 'painter', 'paint', 'interior', 'exterior', 'wall', 'house painting', 'commercial painting'],
    priority: 8
  },
  {
    slug: 'pool-spa-services',
    name: 'Pool & Spa Services',
    keywords: ['pool', 'spa', 'hot tub', 'swimming', 'pool cleaning', 'pool repair', 'pool maintenance', 'jacuzzi'],
    priority: 9
  },
  {
    slug: 'garage-door-services',
    name: 'Garage Door Services',
    keywords: ['garage door', 'garage', 'door repair', 'opener', 'spring', 'door installation', 'automatic door'],
    priority: 9
  },
  {
    slug: 'appliance-repair',
    name: 'Appliance Repair',
    keywords: ['appliance', 'repair', 'refrigerator', 'washer', 'dryer', 'dishwasher', 'oven', 'microwave', 'service'],
    priority: 8
  },
  {
    slug: 'locksmith-services',
    name: 'Locksmith Services',
    keywords: ['locksmith', 'lock', 'key', 'lockout', 'rekey', 'deadbolt', 'security lock', 'emergency locksmith'],
    priority: 9
  },
  {
    slug: 'tree-services',
    name: 'Tree Services',
    keywords: ['tree', 'tree removal', 'tree trimming', 'arborist', 'stump', 'pruning', 'tree care', 'tree cutting'],
    priority: 9
  },
  {
    slug: 'junk-removal',
    name: 'Junk Removal',
    keywords: ['junk removal', 'junk', 'hauling', 'trash', 'debris', 'cleanup', 'removal', 'disposal', 'waste'],
    priority: 8
  },
  {
    slug: 'moving-services',
    name: 'Moving Services',
    keywords: ['moving', 'movers', 'relocation', 'packing', 'storage', 'moving company', 'local moving', 'long distance'],
    priority: 8
  },
  {
    slug: 'solar-installation',
    name: 'Solar Installation',
    keywords: ['solar', 'solar panel', 'solar installation', 'renewable energy', 'photovoltaic', 'solar power', 'energy'],
    priority: 9
  },
  {
    slug: 'home-inspection',
    name: 'Home Inspection',
    keywords: ['home inspection', 'inspector', 'property inspection', 'real estate inspection', 'building inspection'],
    priority: 8
  },
  {
    slug: 'mobile-detailing',
    name: 'Mobile Detailing',
    keywords: ['mobile detailing', 'car detailing', 'auto detailing', 'car wash', 'vehicle cleaning', 'detailing'],
    priority: 8
  },
  {
    slug: 'pressure-washing',
    name: 'Pressure Washing',
    keywords: ['pressure washing', 'power washing', 'pressure wash', 'cleaning', 'driveway cleaning', 'house washing'],
    priority: 8
  },
  {
    slug: 'concrete-services',
    name: 'Concrete Services',
    keywords: ['concrete', 'cement', 'patio', 'driveway', 'sidewalk', 'foundation', 'slab', 'concrete repair'],
    priority: 8
  },
  {
    slug: 'fencing',
    name: 'Fencing',
    keywords: ['fence', 'fencing', 'gate', 'vinyl fence', 'wood fence', 'chain link', 'privacy fence', 'fence repair'],
    priority: 8
  },
  {
    slug: 'deck-patio-services',
    name: 'Deck & Patio Services',
    keywords: ['deck', 'patio', 'pergola', 'gazebo', 'outdoor living', 'deck building', 'patio construction'],
    priority: 8
  },
  {
    slug: 'chimney-services',
    name: 'Chimney Services',
    keywords: ['chimney', 'fireplace', 'chimney cleaning', 'chimney repair', 'flue', 'hearth', 'chimney sweep'],
    priority: 8
  },
  {
    slug: 'septic-sewer-services',
    name: 'Septic & Sewer Services',
    keywords: ['septic', 'sewer', 'septic tank', 'drain field', 'sewage', 'septic pumping', 'septic repair'],
    priority: 8
  },
  {
    slug: 'foundation-repair',
    name: 'Foundation Repair',
    keywords: ['foundation', 'foundation repair', 'structural', 'crack repair', 'settling', 'underpinning', 'basement'],
    priority: 8
  },
  {
    slug: 'mobile-mechanics',
    name: 'Mobile Mechanics',
    keywords: ['mobile mechanic', 'auto repair', 'car repair', 'mechanic', 'automotive', 'mobile auto', 'vehicle repair'],
    priority: 8
  },
  {
    slug: 'mobile-tire-services',
    name: 'Mobile Tire Services',
    keywords: ['mobile tire', 'tire service', 'tire repair', 'tire change', 'tire installation', 'flat tire'],
    priority: 8
  },
  {
    slug: 'mobile-pet-grooming',
    name: 'Mobile Pet Grooming',
    keywords: ['mobile pet grooming', 'pet grooming', 'dog grooming', 'cat grooming', 'pet care', 'mobile grooming'],
    priority: 8
  },
  {
    slug: 'window-tinting',
    name: 'Window Tinting',
    keywords: ['window tinting', 'tinting', 'window film', 'auto tinting', 'residential tinting', 'commercial tinting'],
    priority: 8
  },
  {
    slug: 'gutter-guards',
    name: 'Gutter Guards',
    keywords: ['gutter guard', 'gutter protection', 'leaf guard', 'gutter cover', 'gutter screen', 'gutter filter'],
    priority: 8
  },
  {
    slug: 'outdoor-lighting',
    name: 'Outdoor Lighting',
    keywords: ['outdoor lighting', 'landscape lighting', 'security lighting', 'led lighting', 'pathway lighting'],
    priority: 7
  },
  {
    slug: 'fire-water-damage-restoration',
    name: 'Fire & Water Damage Restoration',
    keywords: ['fire damage', 'water damage', 'restoration', 'emergency restoration', 'flood damage', 'smoke damage'],
    priority: 9
  },
  {
    slug: 'mold-remediation',
    name: 'Mold Remediation',
    keywords: ['mold', 'mold removal', 'mold remediation', 'mold inspection', 'mold testing', 'black mold'],
    priority: 9
  },
  {
    slug: 'insulation-services',
    name: 'Insulation Services',
    keywords: ['insulation', 'insulation installation', 'blown insulation', 'attic insulation', 'energy efficiency'],
    priority: 8
  },
  {
    slug: 'smart-home-installation',
    name: 'Smart Home Installation',
    keywords: ['smart home', 'home automation', 'smart device', 'home technology', 'automated systems', 'iot'],
    priority: 7
  }
];

export class CategoryDetector {
  private mappings: CategoryMapping[];

  constructor() {
    this.mappings = CATEGORY_MAPPINGS.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Detect category from business name, description, and other text
   */
  detectCategory(businessName: string, description?: string, keywords?: string): string | null {
    const searchText = [
      businessName || '',
      description || '',
      keywords || ''
    ].join(' ').toLowerCase();

    // Find the first matching category (highest priority first)
    for (const mapping of this.mappings) {
      if (this.matchesCategory(searchText, mapping)) {
        return mapping.slug;
      }
    }

    return null; // No category matched
  }

  /**
   * Get category name by slug
   */
  getCategoryName(slug: string): string | null {
    const mapping = this.mappings.find(m => m.slug === slug);
    return mapping ? mapping.name : null;
  }

  /**
   * Get all category mappings
   */
  getAllCategories(): CategoryMapping[] {
    return this.mappings;
  }

  /**
   * Check if text matches a category
   */
  private matchesCategory(text: string, mapping: CategoryMapping): boolean {
    // Check if any keyword appears in the text
    return mapping.keywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
  }

  /**
   * Get category suggestions based on confidence score
   */
  getCategorySuggestions(businessName: string, description?: string, keywords?: string): Array<{slug: string; name: string; confidence: number}> {
    const searchText = [
      businessName || '',
      description || '',
      keywords || ''
    ].join(' ').toLowerCase();

    const suggestions = this.mappings.map(mapping => {
      const matches = mapping.keywords.filter(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
      
      const confidence = matches.length / mapping.keywords.length;
      
      return {
        slug: mapping.slug,
        name: mapping.name,
        confidence: confidence * mapping.priority / 10
      };
    })
    .filter(s => s.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

    return suggestions;
  }

  /**
   * Validate category slug exists
   */
  isValidCategory(slug: string): boolean {
    return this.mappings.some(m => m.slug === slug);
  }
}

export default CategoryDetector;