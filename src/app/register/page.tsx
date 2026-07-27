"use client";

import Image from "next/image";
import RegisterForm from "@/components/register/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#F6EFE6] lg:flex">
      {/* =====================================================
          LEFT
          Same image and size as Login
      ===================================================== */}

      <section className="relative hidden min-h-screen overflow-hidden lg:block lg:w-1/2 xl:w-[52%]">
        <Image
          src="/login-pic.png"
          alt="OnTrack task management"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1280px) 50vw, 52vw"
        />

        {/* Same subtle overlay as Login */}
        <div className="absolute inset-0 bg-black/5" />
      </section>

      {/* =====================================================
          RIGHT
          Same background/theme as Login
      ===================================================== */}

      <section className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
        {/* Background decoration */}

        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{
            background: "rgba(127, 156, 135, 0.10)",
            filter: "blur(60px)",
          }}
        />

        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full"
          style={{
            background: "rgba(248, 120, 40, 0.07)",
            filter: "blur(60px)",
          }}
        />

        {/* Mobile brand */}

        <div className="absolute left-5 top-5 flex items-center gap-2 lg:hidden">
          <OnTrackMark size={30} />

          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "#065799" }}
          >
            OnTrack
          </span>
        </div>

        {/* ===================================================
            REGISTER CARD
        =================================================== */}

        <div
          className="relative z-10 w-full max-w-[430px] rounded-3xl border p-7 sm:p-9"
          style={{
            background: "rgba(255, 255, 255, 0.94)",
            borderColor: "rgba(127, 156, 135, 0.22)",
            boxShadow:
              "0 24px 70px rgba(82, 63, 44, 0.10), 0 4px 14px rgba(82, 63, 44, 0.05)",
          }}
        >
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   ONTRACK MARK
=============================================================== */

function OnTrackMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect
        width="32"
        height="32"
        rx="8"
        fill="#7F9C87"
      />

      <path
        d="M8 16.5L13.5 22L24 11"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

