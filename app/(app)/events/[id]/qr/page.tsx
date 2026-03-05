"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft, Copy, Download, Loader2, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Event {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
}

export default function QRCodePage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cameraUrl = typeof window !== "undefined"
    ? `${window.location.origin}/c/${event?.slug}`
    : "";

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch event");
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [params.id]);

  useEffect(() => {
    if (event && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, cameraUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: event.primaryColor || "#000000",
          light: "#FFFFFF",
        },
      });
    }
  }, [event, cameraUrl]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(cameraUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current || !event) return;

    const link = document.createElement("a");
    link.download = `${event.slug}-qrcode.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
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
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/events/${event.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">QR Code</h1>
          <p className="text-muted-foreground">{event.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Scan to Capture</CardTitle>
            <CardDescription>
              Share this QR code with your guests
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="rounded-xl border bg-white p-4">
              <canvas ref={canvasRef} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadQR}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link */}
        <Card>
          <CardHeader>
            <CardTitle>Camera Link</CardTitle>
            <CardDescription>
              Direct link to the camera interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={cameraUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">How to use</h4>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Print the QR code or display it on a screen at your event</li>
                <li>Guests scan the code with their phone camera</li>
                <li>They can immediately start taking photos - no app download needed</li>
                <li>All photos appear in your gallery in real-time</li>
              </ol>
            </div>

            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <h4 className="mb-1 font-medium text-yellow-700">Pro Tips</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700/80">
                <li>Place QR codes at tables, entrances, and photo spots</li>
                <li>Consider printing on table tent cards</li>
                <li>Test the QR code before the event</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
