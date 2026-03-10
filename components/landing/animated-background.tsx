"use client";

import { useEffect, useState } from "react";

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient blobs */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-400/30 via-rose-300/20 to-transparent blur-3xl animate-blob" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-300/25 via-fuchsia-200/15 to-transparent blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-rose-400/20 via-pink-200/10 to-transparent blur-3xl animate-blob animation-delay-4000" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />
    </div>
  );
}

function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-pink-400/40 animate-float-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </>
  );
}

export function DarkAnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-600/20 via-rose-500/10 to-transparent blur-3xl animate-blob" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-500/15 via-fuchsia-400/10 to-transparent blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-rose-600/15 via-pink-400/5 to-transparent blur-3xl animate-blob animation-delay-4000" />
    </div>
  );
}
