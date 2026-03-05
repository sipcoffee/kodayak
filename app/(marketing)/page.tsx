import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  QrCode,
  Image,
  Download,
  Smartphone,
  Wifi,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Every Angle.{" "}
              <span className="text-primary">Every Moment.</span>
              <br />
              One Gallery.
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Turn your event guests into photographers. Create unforgettable
              memories from every perspective with our disposable camera
              experience.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Get started in minutes. No app downloads required for your guests.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Create Event",
                description: "Set up your event with custom settings and branding",
                icon: Camera,
              },
              {
                step: "2",
                title: "Share QR Code",
                description: "Print or display the QR code at your venue",
                icon: QrCode,
              },
              {
                step: "3",
                title: "Guests Capture",
                description: "Guests scan and instantly start taking photos",
                icon: Users,
              },
              {
                step: "4",
                title: "Download Gallery",
                description: "Access all photos in one beautiful gallery",
                icon: Download,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Capture the Moment
            </h2>
            <p className="text-muted-foreground">
              Powerful features designed for seamless event photography.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "No App Required",
                description:
                  "Guests simply scan a QR code and start capturing. Works on any smartphone browser.",
                icon: Smartphone,
              },
              {
                title: "Works Offline",
                description:
                  "Photos are queued and uploaded automatically when connection is restored.",
                icon: Wifi,
              },
              {
                title: "Real-time Gallery",
                description:
                  "Watch your gallery grow in real-time as guests capture moments.",
                icon: Image,
              },
              {
                title: "Instant Access",
                description:
                  "Guests can start taking photos in seconds. No signup required.",
                icon: Clock,
              },
              {
                title: "Bulk Download",
                description:
                  "Download all photos at once in high quality. Your memories, forever.",
                icon: Download,
              },
              {
                title: "Custom Branding",
                description:
                  "Add your event colors and welcome message for a personalized experience.",
                icon: Camera,
              },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Perfect For Any Event</h2>
            <p className="text-muted-foreground">
              From intimate gatherings to large celebrations.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["Weddings", "Corporate Events", "Birthday Parties", "Reunions"].map(
              (useCase) => (
                <Card key={useCase} className="text-center">
                  <CardContent className="py-8">
                    <CheckCircle className="mx-auto mb-3 h-8 w-8 text-primary" />
                    <p className="font-medium">{useCase}</p>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Capture Every Moment?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Start your first event today and see the magic happen.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
