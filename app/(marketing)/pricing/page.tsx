import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";

const planDescriptions: Record<string, string> = {
  BASIC: "Perfect for small gatherings",
  STANDARD: "Great for medium events",
  PREMIUM: "For large celebrations",
};

async function getPlans() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
  return plans;
}

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

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <div>
      {/* Header */}
      <section className="py-24 bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            {plans.map((plan) => {
              const isPopular = plan.type === "STANDARD";
              const price = Number(plan.price).toLocaleString();

              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    isPopular ? "border-primary shadow-lg scale-105" : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {planDescriptions[plan.type] || "For your events"}
                    </p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">₱{price}</span>
                      <span className="text-muted-foreground"> / event</span>
                    </div>

                    <ul className="space-y-3 mb-4 text-left">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mb-6 rounded-lg bg-muted/50 p-3 text-left">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          Photos per guest limit means your total event photos grow with your guest count — no limit on attendees!
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
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
