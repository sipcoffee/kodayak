import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "₱499",
    description: "Perfect for small gatherings",
    features: [
      "100 photos per event",
      "1 day event duration",
      "7 days gallery access",
      "Standard download quality",
      "1 QR code",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Standard",
    price: "₱999",
    description: "Great for medium events",
    features: [
      "500 photos per event",
      "3 days event duration",
      "30 days gallery access",
      "High quality downloads",
      "3 QR codes",
      "Priority support",
      "Minimal branding",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Premium",
    price: "₱1,999",
    description: "For large celebrations",
    features: [
      "Unlimited photos",
      "7 days event duration",
      "Forever gallery access",
      "Original quality downloads",
      "Unlimited QR codes",
      "Dedicated support",
      "Custom branding",
      "Analytics dashboard",
    ],
    cta: "Get Started",
    popular: false,
  },
];

const faqs = [
  {
    question: "How does Kodayak work?",
    answer:
      "Create an event, get a QR code, and share it with your guests. They scan the QR code with their phone, and can instantly start taking photos. All photos are collected in a single gallery that you can access anytime.",
  },
  {
    question: "Do guests need to download an app?",
    answer:
      "No! Kodayak works directly in the browser. Guests simply scan the QR code and they're ready to capture moments. No downloads, no signups required for guests.",
  },
  {
    question: "How do I share the QR code?",
    answer:
      "You can print the QR code on table cards, display it on screens, include it in invitations, or share it digitally. We provide high-resolution QR codes that work in any format.",
  },
  {
    question: "What happens after my event ends?",
    answer:
      "Your gallery remains accessible for the duration specified in your plan. You can download all photos anytime during this period. Premium plans include forever access.",
  },
  {
    question: "Can I extend my event?",
    answer:
      "Yes! You can upgrade your plan or purchase additional days at any time before your event expires.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards, GCash, Maya, and bank transfers through PayMongo, our secure payment processor.",
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Header */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the perfect plan for your event. No hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground"> / event</span>
                  </div>

                  <ul className="space-y-3 mb-6 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about Kodayak.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-8 text-muted-foreground">
              Create your first event and start capturing moments today.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Start Your First Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
