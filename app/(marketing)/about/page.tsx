import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Mail,
  MapPin,
  Heart,
  Target,
  Sparkles,
  MessageSquare,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              About <span className="text-primary">Kodayak</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              We believe the best event photos come from the people who were
              there. Kodayak turns every guest into a photographer, capturing
              moments from every angle.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                title: "Our Mission",
                description:
                  "To democratize event photography by empowering every guest to contribute their unique perspective to a shared memory collection.",
                icon: Target,
              },
              {
                title: "Our Vision",
                description:
                  "A world where no moment goes uncaptured, where every event becomes a collaborative gallery of authentic memories.",
                icon: Sparkles,
              },
              {
                title: "Our Values",
                description:
                  "Simplicity, authenticity, and accessibility. We believe great memories shouldn't require professional equipment or complicated apps.",
                icon: Heart,
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            </div>
            <div className="prose prose-gray dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground mb-6">
                Kodayak was born from a simple observation: the best photos from
                any event often come from unexpected angles and spontaneous
                moments captured by guests, not just the official photographer.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We created a platform that brings back the nostalgic charm of
                disposable cameras while leveraging modern technology. No app
                downloads, no sign-ups for guests – just scan a QR code and
                start capturing.
              </p>
              <p className="text-lg text-muted-foreground">
                Today, Kodayak helps event organizers across the Philippines
                collect thousands of authentic moments from their celebrations,
                creating galleries that tell the complete story of their special
                day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground">
              Have questions or feedback? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href="mailto:hello@kodayak.com"
                        className="text-muted-foreground hover:text-primary"
                      >
                        hello@kodayak.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">
                        Manila, Philippines
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Support</p>
                      <p className="text-muted-foreground">
                        Available Monday - Friday, 9 AM - 6 PM PHT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" placeholder="Juan" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" placeholder="Dela Cruz" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Capture Every Moment?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join hundreds of event organizers who trust Kodayak for their
              celebrations.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
