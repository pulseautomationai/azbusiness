import { useState } from "react";
import { Palette, Eye, Save, RotateCcw, Download, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Slider } from "~/components/ui/slider";
import { FeatureGate } from "~/components/FeatureGate";
import type { PlanTier } from "~/config/features";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  muted: string;
}

interface ThemeSettings {
  colors: ThemeColors;
  borderRadius: number;
  spacing: string;
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: string;
  };
  layout: {
    headerStyle: string;
    cardStyle: string;
    buttonStyle: string;
    shadowLevel: number;
  };
  branding: {
    logoPosition: string;
    showBadges: boolean;
    customCta: string;
    heroStyle: string;
  };
}

interface ProfileThemeCustomizerProps {
  businessId: string;
  planTier: PlanTier;
  currentTheme: ThemeSettings;
  isLoading?: boolean;
  onThemeChange?: (theme: ThemeSettings) => void;
  onSaveTheme?: (theme: ThemeSettings) => void;
  onResetTheme?: () => void;
  onExportTheme?: (theme: ThemeSettings) => void;
  onImportTheme?: (file: File) => void;
}

const defaultThemes = {
  professional: {
    name: "Professional",
    colors: {
      primary: "#1f2937",
      secondary: "#6b7280",
      accent: "#3b82f6",
      background: "#ffffff",
      card: "#f9fafb",
      text: "#111827",
      muted: "#6b7280"
    }
  },
  modern: {
    name: "Modern",
    colors: {
      primary: "#0f172a",
      secondary: "#475569",
      accent: "#06b6d4",
      background: "#ffffff",
      card: "#f8fafc",
      text: "#0f172a",
      muted: "#64748b"
    }
  },
  warm: {
    name: "Warm",
    colors: {
      primary: "#7c2d12",
      secondary: "#a3a3a3",
      accent: "#ea580c",
      background: "#fef7f0",
      card: "#fff7ed",
      text: "#7c2d12",
      muted: "#a3a3a3"
    }
  },
  elegant: {
    name: "Elegant",
    colors: {
      primary: "#374151",
      secondary: "#9ca3af",
      accent: "#8b5cf6",
      background: "#ffffff",
      card: "#f3f4f6",
      text: "#1f2937",
      muted: "#6b7280"
    }
  }
};

export function ProfileThemeCustomizer({ 
  businessId, 
  planTier, 
  currentTheme, 
  isLoading = false,
  onThemeChange,
  onSaveTheme,
  onResetTheme,
  onExportTheme,
  onImportTheme
}: ProfileThemeCustomizerProps) {
  const [theme, setTheme] = useState<ThemeSettings>(currentTheme);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const updateColors = (colorUpdates: Partial<ThemeColors>) => {
    updateTheme({
      colors: { ...theme.colors, ...colorUpdates }
    });
  };

  const applyTemplate = (templateKey: string) => {
    const template = defaultThemes[templateKey as keyof typeof defaultThemes];
    if (template) {
      updateTheme({
        colors: template.colors
      });
      setSelectedTemplate(templateKey);
    }
  };

  const handleSave = () => {
    onSaveTheme?.(theme);
  };

  const handleReset = () => {
    onResetTheme?.();
    setTheme(currentTheme);
  };

  const handleExport = () => {
    onExportTheme?.(theme);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportTheme?.(file);
    }
  };

  return (
    <FeatureGate featureId="custom_themes" planTier={planTier}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Profile Theme Customizer</h2>
            <p className="text-muted-foreground">
              Customize the look and feel of your business profile
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Exit Preview" : "Preview"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Theme
            </Button>
          </div>
        </div>

        {planTier === "free" && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-medium text-orange-800">Limited Theme Options</h3>
                  <p className="text-sm text-orange-700">
                    Upgrade to Pro or Power plan to unlock custom colors, fonts, and advanced styling options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Theme Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="templates" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Templates</CardTitle>
                    <CardDescription>
                      Choose from pre-designed themes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(defaultThemes).map(([key, template]) => (
                        <div
                          key={key}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTemplate === key 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => applyTemplate(key)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{template.name}</span>
                            <div className="flex items-center space-x-1">
                              {Object.entries(template.colors).slice(0, 3).map(([colorKey, color]) => (
                                <div
                                  key={colorKey}
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {planTier !== "free" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Import/Export</CardTitle>
                      <CardDescription>
                        Save and share your custom themes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button variant="outline" onClick={handleExport} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export Theme
                        </Button>
                        <div>
                          <Label htmlFor="import-theme" className="sr-only">Import Theme</Label>
                          <Input
                            id="import-theme"
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('import-theme')?.click()}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Import Theme
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Scheme</CardTitle>
                    <CardDescription>
                      Customize your brand colors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(theme.colors).map(([colorKey, colorValue]) => (
                        <div key={colorKey} className="space-y-2">
                          <Label className="text-sm font-medium capitalize">
                            {colorKey.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="color"
                              value={colorValue}
                              onChange={(e) => updateColors({ [colorKey]: e.target.value } as Partial<ThemeColors>)}
                              className="w-12 h-8 p-1 rounded"
                              disabled={planTier === "free"}
                            />
                            <Input
                              type="text"
                              value={colorValue}
                              onChange={(e) => updateColors({ [colorKey]: e.target.value } as Partial<ThemeColors>)}
                              className="font-mono text-sm"
                              disabled={planTier === "free"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout & Styling</CardTitle>
                    <CardDescription>
                      Adjust spacing, borders, and layout
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Border Radius</Label>
                        <Slider
                          value={[theme.borderRadius]}
                          onValueChange={(value: number[]) => updateTheme({ borderRadius: value[0] })}
                          max={20}
                          step={1}
                          disabled={planTier === "free"}
                        />
                        <div className="text-sm text-muted-foreground">{theme.borderRadius}px</div>
                      </div>

                      <div className="space-y-2">
                        <Label>Shadow Level</Label>
                        <Slider
                          value={[theme.layout.shadowLevel]}
                          onValueChange={(value: number[]) => updateTheme({ 
                            layout: { ...theme.layout, shadowLevel: value[0] }
                          })}
                          max={5}
                          step={1}
                          disabled={planTier === "free"}
                        />
                        <div className="text-sm text-muted-foreground">Level {theme.layout.shadowLevel}</div>
                      </div>

                      <div className="space-y-2">
                        <Label>Header Style</Label>
                        <Select
                          value={theme.layout.headerStyle}
                          onValueChange={(value) => updateTheme({
                            layout: { ...theme.layout, headerStyle: value }
                          })}
                          disabled={planTier === "free"}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="centered">Centered</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                            <SelectItem value="overlay">Overlay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Button Style</Label>
                        <Select
                          value={theme.layout.buttonStyle}
                          onValueChange={(value) => updateTheme({
                            layout: { ...theme.layout, buttonStyle: value }
                          })}
                          disabled={planTier === "free"}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="pill">Pill</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {planTier !== "free" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Typography</CardTitle>
                      <CardDescription>
                        Customize fonts and text styles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Heading Font</Label>
                          <Select
                            value={theme.typography.headingFont}
                            onValueChange={(value) => updateTheme({
                              typography: { ...theme.typography, headingFont: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inter">Inter</SelectItem>
                              <SelectItem value="roboto">Roboto</SelectItem>
                              <SelectItem value="poppins">Poppins</SelectItem>
                              <SelectItem value="montserrat">Montserrat</SelectItem>
                              <SelectItem value="open-sans">Open Sans</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Body Font</Label>
                          <Select
                            value={theme.typography.bodyFont}
                            onValueChange={(value) => updateTheme({
                              typography: { ...theme.typography, bodyFont: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inter">Inter</SelectItem>
                              <SelectItem value="roboto">Roboto</SelectItem>
                              <SelectItem value="source-sans">Source Sans Pro</SelectItem>
                              <SelectItem value="lato">Lato</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Select
                            value={theme.typography.fontSize}
                            onValueChange={(value) => updateTheme({
                              typography: { ...theme.typography, fontSize: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your theme will look on your business profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-6 space-y-4"
                  style={{
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderRadius: `${theme.borderRadius}px`
                  }}
                >
                  {/* Mock Header */}
                  <div 
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.background,
                      borderRadius: `${theme.borderRadius}px`
                    }}
                  >
                    <h3 className="text-lg font-bold">Your Business Name</h3>
                    <p className="text-sm opacity-90">Professional services in Phoenix, AZ</p>
                  </div>

                  {/* Mock Content Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div 
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.muted,
                        borderRadius: `${theme.borderRadius}px`
                      }}
                    >
                      <h4 className="font-medium mb-2">Services</h4>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>
                        Professional consultation and expert solutions
                      </p>
                    </div>

                    <div 
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.muted,
                        borderRadius: `${theme.borderRadius}px`
                      }}
                    >
                      <h4 className="font-medium mb-2">Contact</h4>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>
                        Get in touch for a free consultation
                      </p>
                    </div>
                  </div>

                  {/* Mock Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      className="px-4 py-2 text-sm font-medium text-white transition-colors"
                      style={{
                        backgroundColor: theme.colors.accent,
                        borderRadius: theme.layout.buttonStyle === 'pill' ? '999px' : 
                                     theme.layout.buttonStyle === 'square' ? '4px' : 
                                     `${theme.borderRadius}px`
                      }}
                    >
                      Contact Us
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium border transition-colors"
                      style={{
                        color: theme.colors.accent,
                        borderColor: theme.colors.accent,
                        borderRadius: theme.layout.buttonStyle === 'pill' ? '999px' : 
                                     theme.layout.buttonStyle === 'square' ? '4px' : 
                                     `${theme.borderRadius}px`
                      }}
                    >
                      Learn More
                    </button>
                  </div>

                  {/* Mock Review */}
                  <div 
                    className="p-4 rounded-lg border-l-4"
                    style={{
                      backgroundColor: theme.colors.card,
                      borderLeftColor: theme.colors.accent
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <span className="text-sm font-medium">John D.</span>
                    </div>
                    <p className="text-sm" style={{ color: theme.colors.muted }}>
                      "Excellent service and professional team. Highly recommended!"
                    </p>
                  </div>
                </div>

                {previewMode && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Preview Mode Active</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      This is how your profile will look with the current theme settings.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}