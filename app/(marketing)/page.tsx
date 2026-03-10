"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  QrCode,
  Download,
  Smartphone,
  Wifi,
  Users,
  Clock,
  Sparkles,
  Heart,
  PartyPopper,
  Building2,
  Cake,
  Users2,
  ArrowRight,
  Star,
  CheckCircle2,
  Zap,
  Shield,
  ImageIcon,
} from "lucide-react";
import { AnimatedBackground } from "@/components/landing/animated-background";
import {
  FloatingPolaroids,
  FloatingCameraIcons,
} from "@/components/landing/floating-polaroids";
import { PhoneMockup } from "@/components/landing/phone-mockup";

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex items-center">
        <AnimatedBackground />
        <FloatingCameraIcons />

        <div className="container relative z-10 px-6 md:px-20 py-12 md:py-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-medium mb-6 animate-slide-up-fade">
                <Sparkles className="w-4 h-4" />
                <span>Capture moments from every angle</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up-fade animation-delay-200">
                Every Guest.
                <br />
                <span className="gradient-text">Every Moment.</span>
                <br />
                One Gallery.
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up-fade animation-delay-400">
                Transform your event into a collaborative photo experience.
                Guests scan, snap, and share — no app required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up-fade animation-delay-600">
                <Button
                  size="lg"
                  className="group text-lg px-8 py-6 rounded-full"
                  asChild
                >
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 rounded-full"
                  asChild
                >
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>

              {/* Social proof */}
              <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start animate-slide-up-fade animation-delay-600">
                <div className="flex -space-x-3">
                  {["🎉", "💒", "🎂", "🎊", "👨‍👩‍👧"].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 border-2 border-white flex items-center justify-center text-lg"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">10,000+</span>{" "}
                  moments captured
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="ml-1">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right content - Phone mockup */}
            <div className="relative hidden lg:block">
              <FloatingPolaroids />
              <div className="relative z-10 animate-scale-in animation-delay-400">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Stats Section */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container px-6 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Photos Captured" },
              { value: "2,500+", label: "Events Hosted" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9★", label: "User Rating" },
            ].map((stat, i) => (
              <div
                key={i}
                data-animate
                className="opacity-0"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 md:py-32 relative">
        <div className="container px-6 md:px-16">
          <div className="mx-auto max-w-2xl text-center mb-16" data-animate>
            <span className="inline-block px-4 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-medium mb-4">
              Simple Setup
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Up and running in <span className="gradient-text">minutes</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              No app downloads. No complicated setup. Just scan and capture.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-200 via-pink-400 to-pink-200 hidden md:block" />

            {[
              {
                step: "01",
                title: "Create Your Event",
                description:
                  "Set up in seconds. Add your event name, date, and customize the look with your colors and welcome message.",
                icon: Sparkles,
                color: "from-pink-500 to-rose-500",
              },
              {
                step: "02",
                title: "Share the QR Code",
                description:
                  "Print it on table cards, display it on screens, or include it in your invitations. Guests scan to join instantly.",
                icon: QrCode,
                color: "from-rose-500 to-pink-500",
              },
              {
                step: "03",
                title: "Guests Start Snapping",
                description:
                  "No app needed! Guests open their camera, scan the code, and start capturing memories immediately.",
                icon: Camera,
                color: "from-pink-500 to-fuchsia-500",
              },
              {
                step: "04",
                title: "Download Everything",
                description:
                  "All photos in one place. Download your complete gallery in full resolution whenever you're ready.",
                icon: Download,
                color: "from-fuchsia-500 to-pink-500",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                data-animate
                className={`relative flex items-center gap-8 mb-12 md:mb-20 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Content */}
                <div
                  className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}
                >
                  <Card className="hover-lift border-0 shadow-lg bg-card/50 backdrop-blur">
                    <CardContent className="p-6 md:p-8">
                      <span className="text-5xl font-bold text-pink-100 dark:text-pink-900/50">
                        {item.step}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold mt-2 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Center icon */}
                <div
                  className="hidden md:flex relative z-10 w-16 h-16 rounded-full bg-gradient-to-br shadow-lg items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(135deg, var(--primary), oklch(0.65 0.28 340))`,
                  }}
                >
                  <item.icon className="w-7 h-7 text-white" />
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
                </div>

                {/* Spacer */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32 bg-muted/30 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-40 w-80 h-80 rounded-full bg-pink-200/30 blur-3xl" />
          <div className="absolute bottom-1/4 -left-40 w-80 h-80 rounded-full bg-rose-200/30 blur-3xl" />
        </div>

        <div className="container px-6 md:px-16 relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16" data-animate>
            <span className="inline-block px-4 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-medium mb-4">
              Powerful Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">capture the magic</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for seamless event photography, designed for unforgettable
              memories.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "No App Required",
                description:
                  "Guests simply scan a QR code and start capturing. Works instantly on any smartphone browser.",
                icon: Smartphone,
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                title: "Works Offline",
                description:
                  "Photos are queued locally and uploaded automatically when connection is restored. Never miss a moment.",
                icon: Wifi,
                gradient: "from-green-500 to-emerald-500",
              },
              {
                title: "Real-time Gallery",
                description:
                  "Watch your gallery grow live as guests capture moments. See every photo as it happens.",
                icon: ImageIcon,
                gradient: "from-purple-500 to-violet-500",
              },
              {
                title: "Instant Access",
                description:
                  "Guests can start taking photos in seconds. No signup, no friction, just pure capturing.",
                icon: Zap,
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                title: "Bulk Download",
                description:
                  "Download all photos at once in original quality. Your memories, preserved forever.",
                icon: Download,
                gradient: "from-pink-500 to-rose-500",
              },
              {
                title: "Secure & Private",
                description:
                  "Your photos are encrypted and private. Only you control who sees and accesses them.",
                icon: Shield,
                gradient: "from-indigo-500 to-blue-500",
              },
            ].map((feature, i) => (
              <Card
                key={feature.title}
                data-animate
                className="group hover-lift border-0 shadow-lg bg-card/70 backdrop-blur overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-6 md:p-8 relative">
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <div
                    className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 md:py-32 relative">
        <div className="container px-6 md:px-16">
          <div className="mx-auto max-w-2xl text-center mb-16" data-animate>
            <span className="inline-block px-4 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-medium mb-4">
              Perfect For
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Made for <span className="gradient-text">every celebration</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              From intimate gatherings to grand celebrations, capture it all.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Weddings",
                description:
                  "Capture every angle of your special day through your guests' eyes",
                icon: Heart,
                emoji: "💒",
                gradient: "from-rose-400 to-pink-500",
                image: "from-rose-100 to-pink-200",
              },
              {
                title: "Corporate Events",
                description:
                  "Professional event coverage without the professional price tag",
                icon: Building2,
                emoji: "🏢",
                gradient: "from-blue-400 to-indigo-500",
                image: "from-blue-100 to-indigo-200",
              },
              {
                title: "Birthday Parties",
                description:
                  "Let everyone capture the fun and celebrate together",
                icon: Cake,
                emoji: "🎂",
                gradient: "from-amber-400 to-orange-500",
                image: "from-amber-100 to-orange-200",
              },
              {
                title: "Family Reunions",
                description:
                  "Connect generations through shared photo memories",
                icon: Users2,
                emoji: "👨‍👩‍👧‍👦",
                gradient: "from-emerald-400 to-teal-500",
                image: "from-emerald-100 to-teal-200",
              },
            ].map((useCase, i) => (
              <Card
                key={useCase.title}
                data-animate
                className="group hover-lift border-0 shadow-lg overflow-hidden cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className={`h-40 bg-gradient-to-br ${useCase.image} flex items-center justify-center relative overflow-hidden`}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 opacity-30">
                    <div
                      className="absolute top-2 left-4 text-4xl animate-float-slow"
                      style={{ animationDelay: "0s" }}
                    >
                      📸
                    </div>
                    <div
                      className="absolute bottom-4 right-2 text-3xl animate-float-slow"
                      style={{ animationDelay: "1s" }}
                    >
                      ✨
                    </div>
                    <div
                      className="absolute top-8 right-8 text-2xl animate-float-slow"
                      style={{ animationDelay: "2s" }}
                    >
                      🎉
                    </div>
                  </div>
                  <span className="text-6xl relative z-10 group-hover:scale-125 transition-transform duration-300">
                    {useCase.emoji}
                  </span>
                </div>
                <CardContent className="p-6">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${useCase.gradient} shadow mb-3`}
                  >
                    <useCase.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-pink-200/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl" />
        </div>

        <div className="container px-6 md:px-16 relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16" data-animate>
            <span className="inline-block px-4 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">event hosts</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our customers have to say about their experience.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "Our wedding guests uploaded over 500 photos! We got angles and moments we never would have captured otherwise. Absolutely magical.",
                author: "Sarah & Michael",
                role: "Wedding Couple",
                avatar: "💑",
                rating: 5,
              },
              {
                quote:
                  "Perfect for our company retreat. No app installs, no friction. Everyone just scanned and started sharing. Made my job so much easier.",
                author: "Jennifer K.",
                role: "Event Coordinator",
                avatar: "👩‍💼",
                rating: 5,
              },
              {
                quote:
                  "My daughter's sweet 16 was captured from every angle by her friends. The gallery was filled within hours. She loved it!",
                author: "David R.",
                role: "Parent",
                avatar: "👨",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card
                key={i}
                data-animate
                className="hover-lift border-0 shadow-lg bg-card/70 backdrop-blur"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <CardContent className="p-6 md:p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600" />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container px-6 md:px-16 relative z-10">
          <div
            className="mx-auto max-w-3xl text-center text-white"
            data-animate
          >
            <PartyPopper className="w-16 h-16 mx-auto mb-6 animate-bounce-slow" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to capture every moment?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
              Start your first event today and see the magic unfold. No credit
              card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-white/90 text-lg px-8 py-6 rounded-full group"
                asChild
              >
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 text-lg px-8 py-6 rounded-full"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
              {[
                { icon: CheckCircle2, text: "Free to start" },
                { icon: CheckCircle2, text: "No credit card" },
                { icon: CheckCircle2, text: "Setup in minutes" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
