"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Copy,
  Download,
  Loader2,
  Share2,
  Type,
  Frame,
  FileImage,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetcher } from "@/lib/swr";

interface Event {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  expiresAt: string;
}

type FrameStyle = "none" | "simple" | "rounded" | "elegant" | "modern";
type TemplateType = "plain" | "card" | "poster" | "social";

const frameStyles: { id: FrameStyle; name: string; description: string }[] = [
  { id: "none", name: "None", description: "No frame" },
  { id: "simple", name: "Simple", description: "Clean border" },
  { id: "rounded", name: "Rounded", description: "Soft corners" },
  { id: "elegant", name: "Elegant", description: "Double border" },
  { id: "modern", name: "Modern", description: "Shadow effect" },
];

const templates: { id: TemplateType; name: string; description: string; size: string }[] = [
  { id: "plain", name: "Plain QR", description: "Just the QR code", size: "400x400" },
  { id: "card", name: "Event Card", description: "QR with event details", size: "600x800" },
  { id: "poster", name: "Poster", description: "Large format display", size: "800x1200" },
  { id: "social", name: "Social Story", description: "Instagram/social format", size: "1080x1920" },
];

type BgType = "solid" | "gradient";

interface GradientPreset {
  id: string;
  name: string;
  colors: string[];
  angle?: number; // for linear gradients
  type: "linear" | "radial";
}

const gradientPresets: GradientPreset[] = [
  { id: "sunset", name: "Sunset", colors: ["#FF6B6B", "#FFA07A", "#FFD93D"], angle: 135, type: "linear" },
  { id: "ocean", name: "Ocean", colors: ["#667eea", "#764ba2"], angle: 135, type: "linear" },
  { id: "forest", name: "Forest", colors: ["#134E5E", "#71B280"], angle: 135, type: "linear" },
  { id: "candy", name: "Candy", colors: ["#FF61D2", "#FE9090"], angle: 90, type: "linear" },
  { id: "midnight", name: "Midnight", colors: ["#232526", "#414345"], angle: 180, type: "linear" },
  { id: "peach", name: "Peach", colors: ["#FFECD2", "#FCB69F"], angle: 135, type: "linear" },
  { id: "lavender", name: "Lavender", colors: ["#E8D5F2", "#A8D8EA"], angle: 135, type: "linear" },
  { id: "mint", name: "Mint", colors: ["#D4FC79", "#96E6A1"], angle: 135, type: "linear" },
  { id: "rose", name: "Rose Gold", colors: ["#F4C4F3", "#FC67FA"], angle: 45, type: "linear" },
  { id: "sky", name: "Sky", colors: ["#56CCF2", "#2F80ED"], angle: 180, type: "linear" },
  { id: "warm", name: "Warm", colors: ["#FAD961", "#F76B1C"], angle: 135, type: "linear" },
  { id: "cool", name: "Cool", colors: ["#4facfe", "#00f2fe"], angle: 135, type: "linear" },
];

export default function QRCodePage() {
  const params = useParams();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);

  // Customization state
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("rounded");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("card");
  const [headline, setHeadline] = useState("Scan to Capture");
  const [instructions, setInstructions] = useState("Point your camera at the QR code");
  const [showEventName, setShowEventName] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [qrColor, setQrColor] = useState("");
  const [bgType, setBgType] = useState<BgType>("solid");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [selectedGradient, setSelectedGradient] = useState<string>("sunset");

  const { data: event, isLoading } = useSWR<Event>(
    `/api/events/${params.id}`,
    fetcher
  );

  // Set initial QR color from event
  useEffect(() => {
    if (event && !qrColor) {
      setQrColor(event.primaryColor || "#000000");
    }
  }, [event, qrColor]);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const cameraUrl = event ? `${baseUrl}/c/${event.slug}` : "";

  const renderTemplate = useCallback(
    async (canvas: HTMLCanvasElement, scale: number = 1) => {
      if (!event) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Template dimensions
      const dimensions: Record<TemplateType, { width: number; height: number }> = {
        plain: { width: 400, height: 400 },
        card: { width: 600, height: 800 },
        poster: { width: 800, height: 1200 },
        social: { width: 1080, height: 1920 },
      };

      const { width, height } = dimensions[selectedTemplate];
      canvas.width = width * scale;
      canvas.height = height * scale;

      ctx.scale(scale, scale);

      // Background
      if (bgType === "gradient") {
        const preset = gradientPresets.find((g) => g.id === selectedGradient);
        if (preset) {
          let gradient: CanvasGradient;
          if (preset.type === "linear") {
            const angle = (preset.angle || 0) * (Math.PI / 180);
            const x1 = width / 2 - Math.cos(angle) * width;
            const y1 = height / 2 - Math.sin(angle) * height;
            const x2 = width / 2 + Math.cos(angle) * width;
            const y2 = height / 2 + Math.sin(angle) * height;
            gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          } else {
            gradient = ctx.createRadialGradient(
              width / 2, height / 2, 0,
              width / 2, height / 2, Math.max(width, height) / 2
            );
          }
          preset.colors.forEach((color, index) => {
            gradient.addColorStop(index / (preset.colors.length - 1), color);
          });
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = bgColor;
        }
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fillRect(0, 0, width, height);

      // Generate QR code
      const qrSize = selectedTemplate === "plain" ? 300 : selectedTemplate === "social" ? 600 : 280;
      const qrCanvas = document.createElement("canvas");
      await QRCode.toCanvas(qrCanvas, cameraUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor || "#000000",
          light: "#FFFFFF",
        },
      });

      // Calculate QR position
      let qrX = (width - qrSize) / 2;
      let qrY = selectedTemplate === "plain" ? (height - qrSize) / 2 :
                selectedTemplate === "social" ? 500 :
                selectedTemplate === "poster" ? 350 : 280;

      // Draw frame around QR
      const padding = 20;
      const frameX = qrX - padding;
      const frameY = qrY - padding;
      const frameWidth = qrSize + padding * 2;
      const frameHeight = qrSize + padding * 2;

      if (frameStyle !== "none") {
        ctx.fillStyle = "#FFFFFF";

        if (frameStyle === "rounded" || frameStyle === "modern") {
          roundRect(ctx, frameX, frameY, frameWidth, frameHeight, 16);
          ctx.fill();
        } else if (frameStyle === "elegant") {
          ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
          ctx.strokeStyle = qrColor || "#000000";
          ctx.lineWidth = 3;
          ctx.strokeRect(frameX + 8, frameY + 8, frameWidth - 16, frameHeight - 16);
        } else {
          ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
        }

        if (frameStyle === "simple") {
          ctx.strokeStyle = qrColor || "#000000";
          ctx.lineWidth = 2;
          ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
        }

        if (frameStyle === "modern") {
          ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 8;
          roundRect(ctx, frameX, frameY, frameWidth, frameHeight, 16);
          ctx.fill();
          ctx.shadowColor = "transparent";
        }
      }

      // Draw QR code
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      // Template-specific content
      if (selectedTemplate !== "plain") {
        // Determine text colors based on background
        let isLightBg = true;
        if (bgType === "gradient") {
          const preset = gradientPresets.find((g) => g.id === selectedGradient);
          if (preset) {
            isLightBg = getGradientLuminance(preset.colors) > 0.5;
          }
        } else {
          isLightBg = getLuminance(bgColor) > 0.5;
        }
        const textColors = getTextColors(isLightBg);

        ctx.textAlign = "center";

        // Headline
        if (headline) {
          ctx.font = `bold ${selectedTemplate === "social" ? 72 : selectedTemplate === "poster" ? 56 : 36}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = textColors.primary;
          ctx.fillText(headline, width / 2, selectedTemplate === "social" ? 200 : selectedTemplate === "poster" ? 150 : 80);
        }

        // Event name
        if (showEventName) {
          ctx.font = `${selectedTemplate === "social" ? 48 : selectedTemplate === "poster" ? 40 : 28}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = textColors.secondary;
          ctx.fillText(event.name, width / 2, selectedTemplate === "social" ? 300 : selectedTemplate === "poster" ? 220 : 130);
        }

        // Instructions below QR
        if (instructions) {
          ctx.font = `${selectedTemplate === "social" ? 36 : selectedTemplate === "poster" ? 28 : 18}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = textColors.muted;
          const instrY = qrY + qrSize + padding + (selectedTemplate === "social" ? 100 : selectedTemplate === "poster" ? 80 : 50);
          ctx.fillText(instructions, width / 2, instrY);
        }

        // Date
        if (showDate && event.expiresAt) {
          const date = new Date(event.expiresAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          ctx.font = `${selectedTemplate === "social" ? 32 : selectedTemplate === "poster" ? 24 : 16}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = textColors.subtle;
          const dateY = qrY + qrSize + padding + (selectedTemplate === "social" ? 160 : selectedTemplate === "poster" ? 130 : 85);
          ctx.fillText(date, width / 2, dateY);
        }

        // Tagline above branding
        ctx.font = `bold ${selectedTemplate === "social" ? 36 : selectedTemplate === "poster" ? 28 : 18}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = textColors.primary;
        ctx.fillText("Free disposable camera shots", width / 2, height - (selectedTemplate === "social" ? 140 : selectedTemplate === "poster" ? 100 : 60));

        // Branding at bottom
        ctx.font = `${selectedTemplate === "social" ? 28 : selectedTemplate === "poster" ? 22 : 14}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = textColors.brand;
        ctx.fillText("Powered by Kodayak", width / 2, height - (selectedTemplate === "social" ? 80 : selectedTemplate === "poster" ? 60 : 30));
      }
    },
    [event, cameraUrl, selectedTemplate, frameStyle, headline, instructions, showEventName, showDate, qrColor, bgType, bgColor, selectedGradient]
  );

  // Helper function to calculate luminance from hex color
  function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // Get average luminance of gradient colors
  function getGradientLuminance(colors: string[]): number {
    const luminances = colors.map(getLuminance);
    return luminances.reduce((a, b) => a + b, 0) / luminances.length;
  }

  // Determine if we need light or dark text
  function getTextColors(isLightBg: boolean) {
    if (isLightBg) {
      return {
        primary: "#1a1a1a",
        secondary: "#666666",
        muted: "#888888",
        subtle: "#AAAAAA",
        brand: "#CCCCCC",
      };
    } else {
      return {
        primary: "#FFFFFF",
        secondary: "#E0E0E0",
        muted: "#CCCCCC",
        subtle: "#AAAAAA",
        brand: "rgba(255,255,255,0.5)",
      };
    }
  }

  // Helper function for rounded rectangles
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Update preview
  useEffect(() => {
    if (previewCanvasRef.current && event) {
      renderTemplate(previewCanvasRef.current, 0.5);
    }
  }, [event, renderTemplate]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(cameraUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!event) return;
    setDownloading(true);

    try {
      const canvas = document.createElement("canvas");
      await renderTemplate(canvas, 2); // 2x scale for high resolution

      const link = document.createElement("a");
      link.download = `${event.slug}-${selectedTemplate}-qrcode.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Join ${event.name} and capture moments!`,
          url: cameraUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
        <Button asChild className="mt-4">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/events/${event.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">QR Code Designer</h1>
            <p className="text-muted-foreground">{event.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:h-[calc(100vh-180px)]">
        {/* Customization Panel */}
        <div className="space-y-4 lg:overflow-y-auto lg:pr-4">
          {/* Template Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Choose Template
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`relative flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span className="font-medium text-sm">{template.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {template.description}
                  </span>
                  <span className="text-xs text-muted-foreground/60 mt-1">
                    {template.size}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Frame Style */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Frame className="h-4 w-4" />
                Frame Style
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {frameStyles.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setFrameStyle(frame.id)}
                  className={`relative flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left ${
                    frameStyle === frame.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  {frameStyle === frame.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <span className="font-medium text-sm">{frame.name}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {frame.description}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qrColor">QR Code Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qrColor"
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="flex-1 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Type</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBgType("solid")}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border-2 transition-all ${
                        bgType === "solid"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => setBgType("gradient")}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border-2 transition-all ${
                        bgType === "gradient"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>
              </div>

              {bgType === "solid" ? (
                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 font-mono"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Gradient Presets</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {gradientPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedGradient(preset.id)}
                        className={`relative aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                          selectedGradient === preset.id
                            ? "border-primary ring-2 ring-primary ring-offset-2"
                            : "border-transparent hover:border-muted-foreground/30"
                        }`}
                        style={{
                          background: `linear-gradient(${preset.angle || 135}deg, ${preset.colors.join(", ")})`,
                        }}
                        title={preset.name}
                      >
                        {selectedGradient === preset.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Check className="h-4 w-4 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Text Content */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="h-4 w-4" />
                Text Content
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Scan to Capture"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Input
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Point your camera at the QR code"
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Options & Camera Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Display Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Show Event Name</span>
                  <input
                    type="checkbox"
                    checked={showEventName}
                    onChange={(e) => setShowEventName(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Show Date</span>
                  <input
                    type="checkbox"
                    checked={showDate}
                    onChange={(e) => setShowDate(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Camera Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={cameraUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview */}
        <Card className="lg:sticky lg:top-0 lg:self-start">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Live preview of your QR code design
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-4 sm:p-8">
            <div className="rounded-lg border shadow-sm overflow-hidden bg-muted/30 p-2">
              <canvas ref={previewCanvasRef} className="max-w-full h-auto rounded" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden canvas for downloads */}
      <canvas ref={downloadCanvasRef} className="hidden" />
    </div>
  );
}
