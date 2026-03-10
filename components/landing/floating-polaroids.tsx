"use client";

import { useEffect, useState } from "react";

interface PolaroidProps {
  rotation: number;
  x: number;
  y: number;
  delay: number;
  scale?: number;
  emoji?: string;
  label?: string;
}

function Polaroid({ rotation, x, y, delay, scale = 1, emoji, label }: PolaroidProps) {
  return (
    <div
      className="absolute animate-float-slow transition-transform duration-500 hover:scale-110 hover:z-10"
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="relative bg-white p-2 pb-10 shadow-2xl shadow-black/20 rounded-sm">
        {/* Photo area */}
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 rounded-sm overflow-hidden flex items-center justify-center">
          {emoji ? (
            <span className="text-4xl md:text-5xl">{emoji}</span>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300" />
          )}
        </div>
        {/* Label */}
        {label && (
          <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] md:text-xs text-gray-600 font-handwriting">
            {label}
          </p>
        )}
        {/* Tape effect */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-yellow-100/80 rotate-2 opacity-70" />
      </div>
    </div>
  );
}

export function FloatingPolaroids() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const polaroids: PolaroidProps[] = [
    { rotation: -12, x: 5, y: 10, delay: 0, emoji: "🎉", label: "Party time!" },
    { rotation: 8, x: 80, y: 5, delay: 0.5, emoji: "💒", label: "Wedding day" },
    { rotation: -6, x: 85, y: 55, delay: 1, emoji: "🎂", label: "Birthday!" },
    { rotation: 15, x: -2, y: 60, delay: 1.5, emoji: "👨‍👩‍👧‍👦", label: "Family reunion" },
    { rotation: -8, x: 75, y: 80, delay: 2, scale: 0.8, emoji: "🎊", label: "Celebrate!" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block">
      {polaroids.map((polaroid, i) => (
        <Polaroid key={i} {...polaroid} />
      ))}
    </div>
  );
}

export function FloatingCameraIcons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const icons = [
    { icon: "📸", x: 10, y: 20, delay: 0, size: "text-3xl" },
    { icon: "✨", x: 85, y: 15, delay: 0.3, size: "text-2xl" },
    { icon: "📷", x: 90, y: 70, delay: 0.6, size: "text-3xl" },
    { icon: "⭐", x: 5, y: 75, delay: 0.9, size: "text-2xl" },
    { icon: "💫", x: 15, y: 50, delay: 1.2, size: "text-xl" },
    { icon: "🌟", x: 80, y: 45, delay: 1.5, size: "text-xl" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {icons.map((item, i) => (
        <div
          key={i}
          className={`absolute animate-float-icon ${item.size} opacity-60`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
}
