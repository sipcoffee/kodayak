import Image from "next/image";
import { Camera, FlipHorizontal, Zap, ImageIcon } from "lucide-react";

export function PhoneMockup() {
  const photoCount = 12;

  return (
    <div className="relative mx-auto w-[280px] md:w-[320px]">
      {/* Phone frame */}
      <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-black/40">
        {/* Screen */}
        <div className="relative bg-black rounded-[2.25rem] overflow-hidden aspect-[9/19.5]">
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20" />

          {/* Camera viewfinder with sample image */}
          <div className="absolute inset-0">
            {/* Sample wedding image */}
            <Image
              src="/sample-wed.jpg"
              alt="Wedding photo sample"
              fill
              sizes="(max-width: 768px) 280px, 320px"
              className="object-cover"
              priority
            />

            {/* Subtle overlay for better UI visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

            {/* Grid overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/10" />
              ))}
            </div>

            {/* Focus indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-yellow-400 rounded-lg" />
          </div>

          {/* Top bar */}
          <div className="absolute top-12 left-0 right-0 px-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
            <div className="px-3 py-1 bg-pink-500/80 backdrop-blur rounded-full">
              <span className="text-white text-xs font-medium">Wedding Day 💒</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <FlipHorizontal className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-8 left-0 right-0 px-6 z-10">
            <div className="flex items-center justify-between">
              {/* Gallery preview */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                <ImageIcon className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {photoCount}
                </span>
              </div>

              {/* Shutter button */}
              <button className="relative w-20 h-20 rounded-full bg-white/20 backdrop-blur border-4 border-white flex items-center justify-center group hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-white group-hover:bg-pink-100 transition-colors flex items-center justify-center">
                  <Camera className="w-8 h-8 text-pink-500" />
                </div>
              </button>

              {/* Flip camera */}
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <FlipHorizontal className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Kodayak branding */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <span className="text-white/60 text-[10px] font-medium tracking-wider">KODAYAK</span>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -right-4 top-20 animate-bounce-slow">
        <div className="bg-white rounded-2xl p-3 shadow-xl shadow-black/10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-sm">✓</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">Photo uploaded!</p>
            <p className="text-[10px] text-gray-500">Just now</p>
          </div>
        </div>
      </div>

      {/* Floating QR hint */}
      <div className="absolute -left-8 bottom-32 animate-float-slow animation-delay-1000">
        <div className="bg-white rounded-2xl p-3 shadow-xl shadow-black/10">
          <p className="text-[10px] text-gray-500 mb-1">Scan to join</p>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-8 h-8">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`${
                    [0, 2, 3, 5, 6, 8].includes(i) ? "bg-gray-800" : "bg-transparent"
                  } rounded-[1px]`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
