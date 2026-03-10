"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & stats"
  },
  {
    name: "Events",
    href: "/events",
    icon: Calendar,
    description: "Manage your events"
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
    description: "Plans & payments"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account settings"
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "U";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-card border-r shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-pink-500 shadow-lg">
              <Image
                src="/hires-logo.png"
                alt="Kodayak Logo"
                width={24}
                height={24}
                className="rounded"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              Kodayak
            </span>
            <button
              className="ml-auto lg:hidden p-1 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/20"
                      : "bg-muted group-hover:bg-background"
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className={`text-xs ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 opacity-0 -translate-x-2 transition-all ${
                    isActive ? "opacity-100 translate-x-0" : "group-hover:opacity-50 group-hover:translate-x-0"
                  }`} />
                </Link>
              );
            })}
          </nav>

        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-lg lg:px-6">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Spacer for desktop */}
          <div className="hidden lg:block" />

          {/* User dropdown - only render after mount to avoid hydration mismatch */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full p-1.5 pr-4 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 text-white font-semibold text-sm shadow-lg">
                    {userInitial}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3 rounded-full p-1.5 pr-4">
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              <div className="hidden sm:block space-y-1">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-28 bg-muted rounded animate-pulse" />
              </div>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
