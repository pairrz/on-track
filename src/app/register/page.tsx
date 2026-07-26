"use client";

import RegisterForm from "@/components/register/RegisterForm";
import ProductVisual from "@/components/login/ProductVisual";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left: Product visual */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 flex-shrink-0">
        <ProductVisual />
      </div>

      {/* Right: Register form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 lg:px-12 min-h-screen lg:min-h-0">
        {/* Mobile brand */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <OnTrackMark size={28} />

          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "#4338ca",
            }}
          >
            OnTrack
          </span>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}

function OnTrackMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#markGrad)" />

      <path
        d="M8 16.5L13.5 22L24 11"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <defs>
        <linearGradient
          id="markGrad"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  );
}