import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-3 md:mx-16 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/hires-logo.png"
              alt="Kodayak Logo"
              width={48}
              height={48}
              className="rounded-lg"
              style={{ width: "auto", height: "auto" }}
            />
            <span className="text-xl font-bold">Kodayak</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              How it Works
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="px-6 md:px-16 border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/hires-logo.png"
                  alt="Kodayak Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  style={{ width: "auto", height: "auto" }}
                />
                <span className="text-lg font-bold">Kodayak</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Turn your event guests into photographers. Capture unforgettable
                moments from every angle.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-foreground">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Use Cases</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Weddings</li>
                <li>Corporate Events</li>
                <li>Birthday Parties</li>
                <li>Reunions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Kodayak. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
