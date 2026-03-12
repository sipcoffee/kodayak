import Link from "next/link";
import { Shield, Lock, Eye, Server, Trash2, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Your privacy matters to us. This policy explains how Kodayak
              collects, uses, and protects your information.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: March 12, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-12">
            {/* Introduction */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kodayak (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                web application and services for event photo sharing and
                collection.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Information We Collect</h2>
              </div>

              <div className="space-y-6 pl-0 md:pl-13">
                <div>
                  <h3 className="font-semibold mb-2">Account Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you create an account, we collect your name, email address,
                    and password. If you sign up using a third-party service (like Google),
                    we receive your name and email from that service.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Event Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you create events, we collect event names, descriptions,
                    dates, and customization preferences such as colors and welcome messages.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Photos and Media</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect and store photos uploaded by event hosts and their guests.
                    Photos may include metadata such as the time taken. Guest names are
                    optionally collected when guests choose to provide them.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Usage Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We automatically collect information about how you interact with our
                    service, including pages visited, features used, and device information
                    such as browser type and operating system.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">How We Use Your Information</h2>
              </div>

              <ul className="space-y-3 text-muted-foreground pl-0 md:pl-13">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>To provide and maintain our photo sharing service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>To create and manage your account and events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>To enable guests to upload photos to your events via QR codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>To send you service-related notifications and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>To respond to your inquiries and provide customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>To improve our service and develop new features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>To detect and prevent fraud or abuse</span>
                </li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Data Security</h2>
              </div>

              <p className="text-muted-foreground leading-relaxed pl-0 md:pl-13">
                We implement appropriate technical and organizational security measures
                to protect your personal information against unauthorized access,
                alteration, disclosure, or destruction. Your photos are stored securely
                in cloud storage with encryption. However, no method of transmission
                over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            {/* Data Sharing */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your information
                only in the following circumstances:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span><strong>With your consent:</strong> When you explicitly agree to share information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span><strong>Event participants:</strong> Photos uploaded to an event may be visible to the event host and, if enabled, other guests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span><strong>Service providers:</strong> We use third-party services for hosting, storage, and analytics that may process your data on our behalf</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span><strong>Legal requirements:</strong> When required by law or to protect our rights</span>
                </li>
              </ul>
            </div>

            {/* Data Retention */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Trash2 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Data Retention</h2>
              </div>

              <p className="text-muted-foreground leading-relaxed pl-0 md:pl-13">
                We retain your account information for as long as your account is active.
                Event photos are retained according to your subscription plan and event settings.
                You can delete your photos and events at any time through your dashboard.
                When you delete your account, we will delete your personal information
                within 30 days, except where we are required to retain it for legal purposes.
              </p>
            </div>

            {/* Your Rights */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Access the personal information we hold about you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Request correction of inaccurate information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Request deletion of your personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Download your photos and event data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Object to certain processing of your information</span>
                </li>
              </ul>
            </div>

            {/* Cookies */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to maintain your session,
                remember your preferences, and understand how you use our service.
                You can control cookies through your browser settings, though disabling
                them may affect the functionality of our service.
              </p>
            </div>

            {/* Children */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Children&apos;s Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children under 13.
                If you believe we have collected information from a child under 13,
                please contact us immediately.
              </p>
            </div>

            {/* Changes */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify
                you of any changes by posting the new policy on this page and updating
                the &quot;Last updated&quot; date. We encourage you to review this policy
                periodically.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-4 rounded-2xl bg-muted/50 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Contact Us</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices,
                please contact us at:
              </p>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:kodayakph@gmail.com" className="text-primary hover:underline">
                    kodayakph@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* Back Link */}
            <div className="pt-8 border-t">
              <Link
                href="/"
                className="text-primary hover:underline inline-flex items-center gap-2"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
