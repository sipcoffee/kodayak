"use client";

import { useState } from "react";
import { User, ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setGuestNickname } from "@/lib/image-utils";

interface GuestRegistrationProps {
  eventId: string;
  eventName: string;
  welcomeMessage?: string | null;
  primaryColor: string;
  onComplete: (nickname: string) => void;
}

export function GuestRegistration({
  eventId,
  eventName,
  welcomeMessage,
  primaryColor,
  onComplete,
}: GuestRegistrationProps) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError("Please enter your name");
      return;
    }

    if (trimmedNickname.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (trimmedNickname.length > 30) {
      setError("Name must be less than 30 characters");
      return;
    }

    // Save the nickname
    setGuestNickname(eventId, trimmedNickname);
    onComplete(trimmedNickname);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-white">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -right-32 h-64 w-64 rounded-full opacity-30 blur-3xl animate-pulse"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: primaryColor, animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 8px 32px ${primaryColor}40`,
            }}
          >
            <Camera className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{eventName}</h1>
          {welcomeMessage && (
            <p className="text-gray-400">{welcomeMessage}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              What&apos;s your name?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter your name"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError("");
                }}
                className="h-12 pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:ring-white/20"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <p className="text-xs text-gray-500">
              This will be shown with your photos
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            Start Capturing
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          Powered by <span className="font-medium text-gray-400">Kodayak</span>
        </p>
      </div>
    </div>
  );
}
