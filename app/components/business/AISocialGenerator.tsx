import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Loader2, MessageSquare, Copy, Check, Clock, Hash, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { FeatureGate } from "~/components/FeatureGate";

interface AISocialGeneratorProps {
  businessId: Id<"businesses">;
  planTier: "free" | "pro" | "power";
}

interface SocialPost {
  text: string;
  hashtags: string[];
  callToAction: string;
  bestTime: string;
}

interface SocialContent {
  posts: SocialPost[];
}

const PLATFORM_OPTIONS = {
  facebook: {
    label: "Facebook",
    icon: "📘",
    description: "Longer form, community focused"
  },
  instagram: {
    label: "Instagram", 
    icon: "📷",
    description: "Visual, hashtag friendly"
  },
  linkedin: {
    label: "LinkedIn",
    icon: "💼", 
    description: "Professional, industry focused"
  },
  twitter: {
    label: "Twitter/X",
    icon: "🐦",
    description: "Concise, engaging"
  }
} as const;

const CONTENT_TYPE_OPTIONS = {
  promotional: {
    label: "Promotional",
    description: "Promote services without being pushy"
  },
  educational: {
    label: "Educational",
    description: "Share helpful tips and insights"
  },
  community: {
    label: "Community",
    description: "Connect with local Arizona community"
  },
  seasonal: {
    label: "Seasonal",
    description: "Tie into current season/holidays"
  }
} as const;

type PlatformType = keyof typeof PLATFORM_OPTIONS;
type ContentType = keyof typeof CONTENT_TYPE_OPTIONS;

export function AISocialGenerator({ businessId, planTier }: AISocialGeneratorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>("facebook");
  const [selectedContentType, setSelectedContentType] = useState<ContentType>("promotional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [socialContent, setSocialContent] = useState<SocialContent | null>(null);
  const [copiedPost, setCopiedPost] = useState<number | null>(null);
  
  const generateSocialContent = useMutation(api.aiContent.generateSocialContent);

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSocialContent({
        businessId,
        platform: selectedPlatform,
        contentType: selectedContentType
      });
      
      if (result.success) {
        setSocialContent(result.content);
        toast.success(`Generated ${result.content.posts.length} ${selectedPlatform} posts using ${result.tokensUsed} tokens`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate social content");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPost = async (post: SocialPost, index: number) => {
    const fullText = `${post.text}\n\n${post.hashtags.join(" ")}\n\n${post.callToAction}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedPost(index);
      toast.success("Post copied to clipboard");
      setTimeout(() => setCopiedPost(null), 2000);
    } catch (error) {
      toast.error("Failed to copy post");
    }
  };

  return (
    <FeatureGate
      featureId="aiSocialGeneration"
      planTier={planTier}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              AI Social Media Generator
              <Badge variant="outline">Power Only</Badge>
            </CardTitle>
            <CardDescription>
              Generate engaging social media content tailored to your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 text-center">
              <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                AI Social Media Generator
              </h3>
              <p className="text-blue-700 mb-4">
                Create compelling social media content for all major platforms with AI
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Upgrade to Power Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            AI Social Media Generator
            <Badge variant="secondary">Power Feature</Badge>
          </CardTitle>
          <CardDescription>
            Generate platform-specific social media content that resonates with your local Arizona audience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Social Media Platform</label>
            <Select value={selectedPlatform} onValueChange={(value: PlatformType) => setSelectedPlatform(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose platform" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLATFORM_OPTIONS).map(([key, option]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Type</label>
            <Select value={selectedContentType} onValueChange={(value: ContentType) => setSelectedContentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose content type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTENT_TYPE_OPTIONS).map(([key, option]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <MessageSquare className="h-5 w-5 mr-2" />
            )}
            {isGenerating 
              ? "Generating Content..." 
              : `Generate ${PLATFORM_OPTIONS[selectedPlatform].label} Posts`
            }
          </Button>

          {/* Generated Content */}
          {socialContent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Generated {PLATFORM_OPTIONS[selectedPlatform].label} Posts
                </h3>
                <Badge variant="outline">
                  {CONTENT_TYPE_OPTIONS[selectedContentType].label}
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {socialContent.posts.map((post, index) => (
                  <Card key={index} className="border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{PLATFORM_OPTIONS[selectedPlatform].icon}</span>
                          <span className="font-medium">Post {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {post.bestTime}
                          </div>
                          <Button
                            onClick={() => copyPost(post, index)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            {copiedPost === index ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Post Text */}
                      <Textarea
                        value={post.text}
                        onChange={(e) => {
                          const updatedContent = { ...socialContent };
                          updatedContent.posts[index].text = e.target.value;
                          setSocialContent(updatedContent);
                        }}
                        className="min-h-[100px] resize-none"
                        placeholder="Post content..."
                      />
                      
                      {/* Hashtags */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Hashtags</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.map((hashtag, hashIndex) => (
                            <Badge key={hashIndex} variant="secondary" className="text-xs">
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Call to Action</span>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                          <p className="text-sm text-green-800">{post.callToAction}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleGenerateContent}
                  variant="outline" 
                  className="flex-1"
                  disabled={isGenerating}
                >
                  Generate New Posts
                </Button>
                <Button className="flex-1">
                  Save to Content Library
                </Button>
              </div>
            </div>
          )}

          {/* Platform Tips */}
          {!socialContent && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">
                {PLATFORM_OPTIONS[selectedPlatform].label} Best Practices
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {selectedPlatform === "facebook" && (
                  <>
                    <div>• Posts can be longer and more detailed</div>
                    <div>• Include engaging questions to encourage comments</div>
                    <div>• Share behind-the-scenes content</div>
                  </>
                )}
                {selectedPlatform === "instagram" && (
                  <>
                    <div>• Focus on visual storytelling</div>
                    <div>• Use relevant hashtags (up to 30)</div>
                    <div>• Include location tags for local discovery</div>
                  </>
                )}
                {selectedPlatform === "linkedin" && (
                  <>
                    <div>• Share industry insights and expertise</div>
                    <div>• Use professional tone and language</div>
                    <div>• Include relevant business hashtags</div>
                  </>
                )}
                {selectedPlatform === "twitter" && (
                  <>
                    <div>• Keep it concise and engaging</div>
                    <div>• Use 1-2 relevant hashtags</div>
                    <div>• Include timely or trending topics</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Feature Info */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-cyan-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-cyan-800 mb-1">AI Social Media Features</div>
                <div className="text-cyan-700 space-y-1">
                  <div>• Platform-specific content optimization</div>
                  <div>• Local Arizona market integration</div>
                  <div>• Hashtag and timing recommendations</div>
                  <div>• Multiple content variations per request</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureGate>
  );
}