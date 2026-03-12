import Link from "next/link";
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, Mail } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Please read these terms carefully before using Kodayak.
              By using our service, you agree to be bound by these terms.
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
            {/* Agreement */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Kodayak (&quot;Service&quot;), you agree to be bound
                by these Terms of Service (&quot;Terms&quot;). If you disagree with any part
                of these terms, you may not access the Service. These Terms apply to
                all visitors, users, and others who access or use the Service.
              </p>
            </div>

            {/* Description of Service */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kodayak is a web-based platform that enables event organizers to create
                photo collection events. Guests can scan QR codes to access the camera
                interface and upload photos directly to the event gallery without
                downloading an app or creating an account.
              </p>
            </div>

            {/* Accounts */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                To create events and access certain features, you must register for an account.
                You are responsible for:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Maintaining the confidentiality of your account credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>All activities that occur under your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Providing accurate and complete registration information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Notifying us immediately of any unauthorized use</span>
                </li>
              </ul>
            </div>

            {/* Acceptable Use */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">4. Acceptable Use</h2>
              </div>

              <p className="text-muted-foreground leading-relaxed pl-0 md:pl-13">
                You agree to use Kodayak only for lawful purposes and in accordance
                with these Terms. You may:
              </p>
              <ul className="space-y-3 text-muted-foreground pl-0 md:pl-13">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1.5">✓</span>
                  <span>Create events for personal celebrations, corporate gatherings, and social occasions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1.5">✓</span>
                  <span>Share QR codes with your event guests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1.5">✓</span>
                  <span>Download and use photos from your events for personal or promotional purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1.5">✓</span>
                  <span>Customize your event settings and appearance</span>
                </li>
              </ul>
            </div>

            {/* Prohibited Use */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold">5. Prohibited Activities</h2>
              </div>

              <p className="text-muted-foreground leading-relaxed pl-0 md:pl-13">
                You agree NOT to:
              </p>
              <ul className="space-y-3 text-muted-foreground pl-0 md:pl-13">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1.5">✗</span>
                  <span>Upload illegal, harmful, threatening, abusive, or objectionable content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1.5">✗</span>
                  <span>Upload content that infringes on intellectual property rights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1.5">✗</span>
                  <span>Upload content depicting minors in inappropriate situations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1.5">✗</span>
                  <span>Attempt to gain unauthorized access to our systems or other users&apos; accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1.5">✗</span>
                  <span>Use the service to distribute malware or spam</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1.5">✗</span>
                  <span>Interfere with or disrupt the service or servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1.5">✗</span>
                  <span>Resell or redistribute the service without authorization</span>
                </li>
              </ul>
            </div>

            {/* User Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">6. User Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of photos and content you upload to Kodayak.
                By uploading content, you grant us a limited license to store, display,
                and transmit that content solely for the purpose of providing the Service.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You are solely responsible for the content you upload and must ensure
                you have the necessary rights to share such content. Event hosts are
                responsible for the content uploaded by their guests.
              </p>
            </div>

            {/* Films and Payments */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">7. Films and Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kodayak operates on a &quot;film&quot; system where you purchase or redeem
                films to create events. Each film has specific limits (photo count,
                event duration) based on the plan type.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Films are non-refundable once used to create an event</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Unused films may have expiration dates as specified at the time of purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Redemption codes are single-use and non-transferable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>We reserve the right to modify pricing and plans at any time</span>
                </li>
              </ul>
            </div>

            {/* Service Availability */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold">8. Service Availability</h2>
              </div>

              <p className="text-muted-foreground leading-relaxed pl-0 md:pl-13">
                We strive to maintain high availability but do not guarantee uninterrupted
                access to the Service. We may temporarily suspend access for maintenance,
                updates, or circumstances beyond our control. We are not liable for any
                loss or damage resulting from service interruptions.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">9. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Kodayak name, logo, and all related names, logos, product and service
                names, designs, and slogans are trademarks of Kodayak. The Service and
                its original content (excluding user content), features, and functionality
                are owned by Kodayak and are protected by copyright, trademark, and other laws.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">10. Disclaimer of Warranties</h2>
              </div>

              <p className="text-muted-foreground leading-relaxed pl-0 md:pl-13">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
                OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE
                WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. YOUR USE OF THE SERVICE IS
                AT YOUR SOLE RISK.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">11. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, KODAYAK SHALL NOT BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                INCLUDING LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING
                FROM YOUR USE OR INABILITY TO USE THE SERVICE.
              </p>
            </div>

            {/* Indemnification */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">12. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless Kodayak and its officers, directors,
                employees, and agents from any claims, damages, losses, or expenses arising
                from your use of the Service, your violation of these Terms, or your violation
                of any rights of another party.
              </p>
            </div>

            {/* Termination */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">13. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately,
                without prior notice, for conduct that we believe violates these Terms or is
                harmful to other users, us, or third parties, or for any other reason at our
                sole discretion.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may terminate your account at any time by contacting us or using the
                account deletion feature. Upon termination, your right to use the Service
                will cease immediately.
              </p>
            </div>

            {/* Governing Law */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">14. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws
                of the Republic of the Philippines, without regard to its conflict of law
                provisions. Any disputes arising from these Terms shall be resolved in the
                courts of the Philippines.
              </p>
            </div>

            {/* Changes */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">15. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users
                of any material changes by posting the new Terms on this page and updating
                the &quot;Last updated&quot; date. Your continued use of the Service after any changes
                constitutes acceptance of the new Terms.
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
                If you have any questions about these Terms of Service, please contact us at:
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

            {/* Related Links */}
            <div className="pt-8 border-t flex flex-col sm:flex-row gap-4 sm:justify-between">
              <Link
                href="/"
                className="text-primary hover:underline inline-flex items-center gap-2"
              >
                ← Back to Home
              </Link>
              <Link
                href="/privacy"
                className="text-primary hover:underline inline-flex items-center gap-2"
              >
                Read our Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
