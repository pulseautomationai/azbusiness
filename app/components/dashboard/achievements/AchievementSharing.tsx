import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandInstagram,
  IconLink,
  IconDownload,
  IconShare,
  IconCopy,
  IconCheck
} from "@tabler/icons-react";
import { AchievementBadge, AchievementShowcase } from "~/components/ui/achievement-badge";
import type { Doc } from "~/convex/_generated/dataModel";

interface AchievementSharingProps {
  business: Doc<"businesses">;
  achievements: Doc<"achievements">[];
  selectedAchievement?: Doc<"achievements">;
}

export function AchievementSharing({ business, achievements, selectedAchievement }: AchievementSharingProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'single' | 'showcase' | 'milestone'>('single');

  const handleCopyLink = async () => {
    const businessUrl = `https://azbusiness.com/${business.urlPath}`;
    await navigator.clipboard.writeText(businessUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const generateShareText = (platform: string) => {
    const baseText = selectedAchievement 
      ? `🏆 Just earned the "${selectedAchievement.displayName}" achievement! ${selectedAchievement.description}`
      : `🏆 Proud to have earned ${achievements.length} achievements for ${business.name}!`;
    
    const hashtags = platform === 'twitter' ? ' #AZBusiness #ServiceExcellence #LocalBusiness' : '';
    const url = ` https://azbusiness.com/${business.urlPath}`;
    
    return baseText + url + hashtags;
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://azbusiness.com/${business.urlPath}`)}&quote=${encodeURIComponent(generateShareText('facebook'))}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(generateShareText('twitter'))}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://azbusiness.com/${business.urlPath}`)}&title=${encodeURIComponent(`${business.name} Achievement`)}`,
    instagram: '#' // Instagram doesn't support direct URL sharing
  };

  const shareTemplates = [
    {
      id: 'single',
      name: 'Single Achievement',
      description: 'Share a specific achievement',
      preview: selectedAchievement ? (
        <div className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center gap-3">
            <AchievementBadge
              achievementName={selectedAchievement.displayName}
              tier={selectedAchievement.tierLevel as any}
              size="large"
              context="card"
              category="excellence"
            />
            <div>
              <p className="font-semibold">{selectedAchievement.displayName}</p>
              <p className="text-sm text-muted-foreground">{business.name}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded-lg text-center text-muted-foreground">
          Select an achievement to preview
        </div>
      )
    },
    {
      id: 'showcase',
      name: 'Achievement Showcase',
      description: 'Display all achievements',
      preview: (
        <div className="p-4 border rounded-lg space-y-3">
          <div className="text-center">
            <h3 className="font-semibold">{business.name}</h3>
            <p className="text-sm text-muted-foreground">{achievements.length} Achievements Earned</p>
          </div>
          <AchievementShowcase
            achievements={achievements.slice(0, 4).map(a => ({
              name: a.displayName,
              tier: a.tierLevel as any,
              category: 'excellence'
            }))}
            maxDisplay={4}
            size="small"
            context="card"
          />
        </div>
      )
    },
    {
      id: 'milestone',
      name: 'Milestone Celebration',
      description: 'Celebrate achievement milestones',
      preview: (
        <div className="p-4 border rounded-lg text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <h3 className="font-semibold">{business.name}</h3>
          <p className="text-sm text-muted-foreground">
            Reached {achievements.length} achievements milestone!
          </p>
          <div className="flex justify-center">
            <Badge variant="success">Service Excellence</Badge>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShare className="w-5 h-5" />
            Share Your Achievements
          </CardTitle>
          <CardDescription>
            Promote your business success and build credibility with customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {shareTemplates.map((template) => (
                <div 
                  key={template.id}
                  className={`cursor-pointer border rounded-lg p-4 transition-all ${
                    selectedTemplate === template.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id as any)}
                >
                  <div className="space-y-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              ))}\n            </div>
            
            {/* Template Preview */}
            <div className="space-y-3">
              <h4 className="font-medium">Preview</h4>
              {shareTemplates.find(t => t.id === selectedTemplate)?.preview}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Share on Social Media</CardTitle>
          <CardDescription>
            Increase your visibility and attract new customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-3 h-12"
              onClick={() => window.open(shareUrls.facebook, '_blank')}
            >
              <IconBrandFacebook className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Facebook</p>
                <p className="text-xs text-muted-foreground">Share with friends</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-3 h-12"
              onClick={() => window.open(shareUrls.twitter, '_blank')}
            >
              <IconBrandTwitter className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <p className="font-medium">Twitter</p>
                <p className="text-xs text-muted-foreground">Tweet your success</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-3 h-12"
              onClick={() => window.open(shareUrls.linkedin, '_blank')}
            >
              <IconBrandLinkedin className="w-5 h-5 text-blue-700" />
              <div className="text-left">
                <p className="font-medium">LinkedIn</p>
                <p className="text-xs text-muted-foreground">Professional network</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-3 h-12"
              disabled
            >
              <IconBrandInstagram className="w-5 h-5 text-pink-600" />
              <div className="text-left">
                <p className="font-medium">Instagram</p>
                <p className="text-xs text-muted-foreground">Story/post manually</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Direct Link Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLink className="w-5 h-5" />
            Direct Link Sharing
          </CardTitle>
          <CardDescription>
            Copy your business profile link to share anywhere
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
                <code className="text-sm">https://azbusiness.com/{business.urlPath}</code>
              </div>
              <Button 
                variant="outline" 
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <IconCheck className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <IconDownload className="w-4 h-4" />
                Download Achievement Image
              </Button>
              <Button variant="outline" size="sm">
                Generate QR Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Tips</CardTitle>
          <CardDescription>
            Maximize the impact of your achievement sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Share consistently</p>
                <p className="text-sm text-muted-foreground">Post new achievements within 24 hours of earning them</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Include customer stories</p>
                <p className="text-sm text-muted-foreground">Connect achievements to real customer experiences</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Use local hashtags</p>
                <p className="text-sm text-muted-foreground">Include #{business.city}Business and relevant service tags</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}