"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "That email or password doesn't match our records.",
  OAuthAccountNotLinked:
    "That email is already registered a different way. Try signing in with email and password.",
  Default: "Something went wrong. Please try again.",
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Email / Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(errorMessages[res.error] || errorMessages.Default);
      return;
    }

    if (res?.ok) {
      router.push("/dashboard");
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    await signIn("google", {
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
      {/* =========================================================
          LEFT : PRODUCT VISUAL
      ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 flex-shrink-0">
        <ProductVisual />
      </div>

      {/* =========================================================
          RIGHT : LOGIN FORM
      ========================================================= */}
      <div className="relative flex-1 flex items-center justify-center bg-white px-6 py-12 lg:px-12 min-h-screen lg:min-h-0">
        {/* Mobile brand */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <OnTrackMark size={28} />

          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              color: "#4338ca",
            }}
          >
            OnTrack
          </span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-gray-900 tracking-tight"
              style={{
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              Welcome back
            </h1>

            <p className="mt-2 text-[15px] text-gray-500 leading-relaxed">
              Sign in to continue to your OnTrack workspace.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* =====================================================
              LOGIN FORM
          ===================================================== */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-150"
                style={{
                  border: emailFocused
                    ? "1.5px solid #6366f1"
                    : "1.5px solid #e5e7eb",
                  boxShadow: emailFocused
                    ? "0 0 0 3px rgba(99,102,241,0.12)"
                    : "0 1px 2px rgba(0,0,0,0.04)",
                  background: "#fafafa",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-150"
                  style={{
                    border: passwordFocused
                      ? "1.5px solid #6366f1"
                      : "1.5px solid #e5e7eb",
                    boxShadow: passwordFocused
                      ? "0 0 0 3px rgba(99,102,241,0.12)"
                      : "0 1px 2px rgba(0,0,0,0.04)",
                    background: "#fafafa",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />

                <div
                  className="relative w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150"
                  style={{
                    border: rememberMe
                      ? "1.5px solid #6366f1"
                      : "1.5px solid #d1d5db",
                    background: rememberMe ? "#6366f1" : "white",
                  }}
                >
                  {rememberMe && (
                    <svg
                      width="9"
                      height="7"
                      viewBox="0 0 9 7"
                      fill="none"
                    >
                      <path
                        d="M1 3.5L3.5 6L8 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
              </label>

              <a
                href="/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white text-[15px] font-semibold transition-all duration-150 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />

            <span className="text-xs font-medium text-gray-400 px-1">
              or
            </span>

            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-[15px] font-medium text-gray-700 bg-white transition-all duration-150 disabled:opacity-60"
            style={{
              border: "1.5px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {googleLoading ? (
              <LoadingSpinner />
            ) : (
              <GoogleIcon />
            )}

            {googleLoading
              ? "Connecting..."
              : "Continue with Google"}
          </button>

          {/* Sign up */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   ONTRACK LOGO
=============================================================== */

function OnTrackMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <rect
        width="32"
        height="32"
        rx="8"
        fill="url(#markGrad)"
      />

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

/* ===============================================================
   PRODUCT VISUAL
=============================================================== */

function ProductVisual() {
  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(145deg, #0f0e1a 0%, #16152a 45%, #1a1840 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(99,102,241,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-8">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-12">
          <OnTrackMark size={36} />

          <span className="text-2xl font-bold tracking-tight text-white">
            OnTrack
          </span>
        </div>

        {/* Illustration */}
        <TaskJourneyIllustration />

        {/* Tagline */}
        <div className="mt-12">
          <p className="text-2xl font-semibold text-white leading-snug">
            Stay on track.
            <br />
            Get things done.
          </p>

          <p
            className="mt-3 text-sm leading-relaxed"
            style={{
              color: "rgba(165,180,252,0.75)",
            }}
          >
            Plan your work, track your progress, and celebrate
            every completion — all in one elegant workspace.
          </p>
        </div>

        {/* Social proof */}
        <div className="mt-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[
              "#818cf8",
              "#6366f1",
              "#a5b4fc",
              "#4f46e5",
            ].map((color, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white text-xs font-semibold"
                style={{
                  backgroundColor: color,
                  borderColor: "#16152a",
                }}
              >
                {["A", "M", "J", "S"][i]}
              </div>
            ))}
          </div>

          <p
            className="text-xs"
            style={{
              color: "rgba(165,180,252,0.6)",
            }}
          >
            Joined by{" "}
            <span style={{ color: "rgba(165,180,252,0.9)" }}>
              12,000+
            </span>{" "}
            teams worldwide
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   TASK JOURNEY ILLUSTRATION
=============================================================== */

function TaskJourneyIllustration() {
  return (
    <div
      className="relative w-full"
      style={{ height: 340 }}
    >
      <svg
        viewBox="0 0 380 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        {/* Connection */}
        <path
          d="M72 100 C120 100,120 170,190 170 C260 170,260 240,310 240"
          stroke="url(#pathGrad)"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.5"
        />

        {/* Nodes */}
        <circle
          cx="72"
          cy="100"
          r="5"
          fill="#818cf8"
          opacity="0.6"
        />

        <circle
          cx="190"
          cy="170"
          r="5"
          fill="#818cf8"
          opacity="0.6"
        />

        <circle
          cx="310"
          cy="240"
          r="5"
          fill="#818cf8"
          opacity="0.6"
        />

        {/* Decorative orbs */}
        <circle
          cx="300"
          cy="60"
          r="40"
          fill="rgba(99,102,241,0.07)"
        />

        <circle
          cx="60"
          cy="270"
          r="28"
          fill="rgba(99,102,241,0.07)"
        />

        {/* Calendar */}
        <g transform="translate(270,30)">
          <rect
            width="84"
            height="72"
            rx="10"
            fill="rgba(30,28,56,0.9)"
            stroke="rgba(99,102,241,0.3)"
          />

          <rect
            width="84"
            height="22"
            rx="10"
            fill="rgba(99,102,241,0.25)"
          />

          <rect
            y="10"
            width="84"
            height="12"
            fill="rgba(99,102,241,0.25)"
          />

          <text
            x="42"
            y="16"
            textAnchor="middle"
            fontSize="8"
            fill="rgba(165,180,252,0.9)"
            fontWeight="600"
          >
            TASKS
          </text>

          {[0, 1, 2, 3, 4, 5, 6].map((col) => (
            <circle
              key={col}
              cx={10 + col * 11}
              cy="35"
              r="2.5"
              fill={
                col === 3
                  ? "#818cf8"
                  : "rgba(165,180,252,0.2)"
              }
            />
          ))}

          {[0, 1, 2, 3, 4, 5, 6].map((col) => (
            <circle
              key={col}
              cx={10 + col * 11}
              cy="50"
              r="2.5"
              fill={
                col < 5
                  ? "rgba(165,180,252,0.3)"
                  : "rgba(165,180,252,0.1)"
              }
            />
          ))}

          {[0, 1, 2, 3].map((col) => (
            <circle
              key={col}
              cx={10 + col * 11}
              cy="65"
              r="2.5"
              fill="rgba(165,180,252,0.15)"
            />
          ))}
        </g>

        {/* PLAN */}
        <g transform="translate(0,60)">
          <rect
            width="130"
            height="70"
            rx="12"
            fill="rgba(30,28,56,0.95)"
            stroke="rgba(99,102,241,0.35)"
          />

          <rect
            x="10"
            y="10"
            width="36"
            height="14"
            rx="4"
            fill="rgba(99,102,241,0.3)"
          />

          <text
            x="28"
            y="20.5"
            textAnchor="middle"
            fontSize="7.5"
            fill="#a5b4fc"
            fontWeight="700"
          >
            PLAN
          </text>

          <circle
            cx="18"
            cy="40"
            r="5"
            stroke="rgba(165,180,252,0.4)"
            strokeWidth="1.5"
          />

          <rect
            x="28"
            y="36"
            width="60"
            height="5"
            rx="2.5"
            fill="rgba(165,180,252,0.25)"
          />

          <rect
            x="28"
            y="45"
            width="40"
            height="4"
            rx="2"
            fill="rgba(165,180,252,0.12)"
          />

          <rect
            x="10"
            y="56"
            width="110"
            height="4"
            rx="2"
            fill="rgba(99,102,241,0.15)"
          />

          <rect
            x="10"
            y="56"
            width="35"
            height="4"
            rx="2"
            fill="rgba(99,102,241,0.6)"
          />
        </g>

        {/* TRACK */}
        <g transform="translate(125,130)">
          <rect
            width="130"
            height="80"
            rx="12"
            fill="rgba(30,28,56,0.95)"
            stroke="rgba(99,102,241,0.45)"
            strokeWidth="1.5"
          />

          <rect
            x="10"
            y="10"
            width="40"
            height="14"
            rx="4"
            fill="rgba(99,102,241,0.4)"
          />

          <text
            x="30"
            y="20.5"
            textAnchor="middle"
            fontSize="7.5"
            fill="#a5b4fc"
            fontWeight="700"
          >
            TRACK
          </text>

          <circle
            cx="110"
            cy="17"
            r="8"
            stroke="rgba(99,102,241,0.2)"
            strokeWidth="2.5"
          />

          <circle
            cx="110"
            cy="17"
            r="8"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeDasharray="32"
            strokeDashoffset="10"
            strokeLinecap="round"
            transform="rotate(-90 110 17)"
          />

          <text
            x="110"
            y="20"
            textAnchor="middle"
            fontSize="5.5"
            fill="#a5b4fc"
            fontWeight="700"
          >
            68%
          </text>

          {[
            { done: true, w: 72 },
            { done: true, w: 52 },
            { done: false, w: 64 },
          ].map((task, i) => (
            <g
              key={i}
              transform={`translate(10, ${38 + i * 13})`}
            >
              {task.done ? (
                <circle
                  cx="5"
                  cy="5"
                  r="5"
                  fill="rgba(99,102,241,0.5)"
                />
              ) : (
                <circle
                  cx="5"
                  cy="5"
                  r="5"
                  stroke="rgba(165,180,252,0.3)"
                  strokeWidth="1.5"
                />
              )}

              {task.done && (
                <path
                  d="M2.5 5L4.5 7L7.5 3"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              <rect
                x="15"
                y="2"
                width={task.w}
                height="4.5"
                rx="2"
                fill={
                  task.done
                    ? "rgba(165,180,252,0.2)"
                    : "rgba(165,180,252,0.12)"
                }
              />
            </g>
          ))}
        </g>

        {/* COMPLETE */}
        <g transform="translate(250,210)">
          <rect
            width="130"
            height="70"
            rx="12"
            fill="rgba(30,28,56,0.95)"
            stroke="rgba(99,102,241,0.35)"
          />

          <rect
            x="10"
            y="10"
            width="60"
            height="14"
            rx="4"
            fill="rgba(79,70,229,0.35)"
          />

          <text
            x="40"
            y="20.5"
            textAnchor="middle"
            fontSize="7.5"
            fill="#a5b4fc"
            fontWeight="700"
          >
            COMPLETE
          </text>

          <circle
            cx="110"
            cy="17"
            r="8"
            fill="rgba(99,102,241,0.5)"
          />

          <path
            d="M106.5 17L109 19.5L113.5 14.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {[55, 42, 68].map((w, i) => (
            <g
              key={i}
              transform={`translate(10, ${38 + i * 10})`}
            >
              <circle
                cx="4"
                cy="4"
                r="4"
                fill="rgba(99,102,241,0.45)"
              />

              <path
                d="M2 4L3.5 5.5L6 2.5"
                stroke="white"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <rect
                x="13"
                y="1.5"
                width={w}
                height="4"
                rx="2"
                fill="rgba(165,180,252,0.15)"
              />
            </g>
          ))}
        </g>

        {/* Floating tags */}
        <g transform="translate(170,60)">
          <rect
            width="56"
            height="20"
            rx="6"
            fill="rgba(99,102,241,0.2)"
            stroke="rgba(99,102,241,0.3)"
          />

          <circle
            cx="10"
            cy="10"
            r="3"
            fill="#818cf8"
          />

          <rect
            x="18"
            y="7"
            width="30"
            height="4"
            rx="2"
            fill="rgba(165,180,252,0.3)"
          />
        </g>

        <g transform="translate(40,190)">
          <rect
            width="64"
            height="20"
            rx="6"
            fill="rgba(99,102,241,0.15)"
            stroke="rgba(99,102,241,0.25)"
          />

          <circle
            cx="10"
            cy="10"
            r="3"
            fill="rgba(165,180,252,0.5)"
          />

          <rect
            x="18"
            y="7"
            width="38"
            height="4"
            rx="2"
            fill="rgba(165,180,252,0.2)"
          />
        </g>

        <g transform="translate(220,295)">
          <rect
            width="76"
            height="20"
            rx="6"
            fill="rgba(99,102,241,0.15)"
            stroke="rgba(99,102,241,0.25)"
          />

          <circle
            cx="10"
            cy="10"
            r="3"
            fill="rgba(129,140,248,0.6)"
          />

          <rect
            x="18"
            y="7"
            width="48"
            height="4"
            rx="2"
            fill="rgba(165,180,252,0.2)"
          />
        </g>

        {/* Labels */}
        <text
          x="36"
          y="96"
          fontSize="9"
          fill="rgba(165,180,252,0.45)"
          fontWeight="600"
        >
          PLAN
        </text>

        <text
          x="164"
          y="166"
          fontSize="9"
          fill="rgba(165,180,252,0.45)"
          fontWeight="600"
        >
          TRACK
        </text>

        <text
          x="283"
          y="236"
          fontSize="9"
          fill="rgba(165,180,252,0.45)"
          fontWeight="600"
        >
          DONE
        </text>

        <defs>
          <linearGradient
            id="pathGrad"
            x1="72"
            y1="100"
            x2="310"
            y2="240"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ===============================================================
   ICONS
=============================================================== */

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M6.71 6.71L17.29 17.29" />
      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />

      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />

      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />

      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}