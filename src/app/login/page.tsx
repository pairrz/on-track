"use client";

import Image from "next/image";
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

  // =========================================================
  // Email / Password Login
  // =========================================================

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

  // =========================================================
  // Google Login
  // =========================================================

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    await signIn("google", {
      callbackUrl: "/dashboard",
    });
  };

  return (
    <main className="min-h-screen bg-[#F6EFE6] lg:flex">

      <section className="relative hidden min-h-screen overflow-hidden lg:block lg:w-1/2 xl:w-[52%]">
        <Image
          src="/login-pic.png"
          alt="OnTrack task management"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1280px) 50vw, 52vw"
        />

        {/* subtle overlay */}
        <div className="absolute inset-0 bg-black/5" />

      </section>

      {/* =====================================================
          RIGHT
          Dashboard Theme
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
            LOGIN CARD
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
          {/* Header */}

          <div className="mb-7">
            <div className="mb-6 flex items-center gap-2.5 lg:hidden">
              <OnTrackMark size={32} />

              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: "#065799" }}
              >
                OnTrack
              </span>
            </div>

            <h1
  className="text-3xl font-bold tracking-tight"
  style={{
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#065799",
  }}
>
  Welcome back
</h1>

            <p
              className="mt-2 text-[15px] leading-relaxed"
              style={{ color: "#747A75" }}
            >
              Sign in to continue to your OnTrack workspace.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div
              className="mb-6 rounded-xl px-4 py-3 text-sm"
              style={{
                border: "1px solid rgba(248, 120, 40, 0.25)",
                background: "rgba(248, 120, 40, 0.08)",
                color: "#C65316",
              }}
            >
              {error}
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "#344E5C" }}
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
                className="w-full rounded-xl px-4 py-3 text-[15px] outline-none transition-all duration-150"
                style={{
                  color: "#163B50",
                  background: "#FFFCF8",
                  border: emailFocused
                    ? "1.5px solid #7F9C87"
                    : "1.5px solid #D8D5CF",
                  boxShadow: emailFocused
                    ? "0 0 0 4px rgba(127, 156, 135, 0.13)"
                    : "0 1px 2px rgba(80, 60, 40, 0.03)",
                }}
              />
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "#344E5C" }}
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
                  className="w-full rounded-xl px-4 py-3 pr-12 text-[15px] outline-none transition-all duration-150"
                  style={{
                    color: "#163B50",
                    background: "#FFFCF8",
                    border: passwordFocused
                      ? "1.5px solid #7F9C87"
                      : "1.5px solid #D8D5CF",
                    boxShadow: passwordFocused
                      ? "0 0 0 4px rgba(127, 156, 135, 0.13)"
                      : "0 1px 2px rgba(80, 60, 40, 0.03)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-[#F1ECE5]"
                  style={{ color: "#7A817B" }}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}

            <div className="flex items-center justify-between">
              <label className="group flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />

                <div
                  className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center rounded transition-all"
                  style={{
                    border: rememberMe
                      ? "1.5px solid #7F9C87"
                      : "1.5px solid #C9C7C1",
                    background: rememberMe ? "#7F9C87" : "#FFFFFF",
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

                <span
                  className="text-sm"
                  style={{ color: "#66716B" }}
                >
                  Remember me
                </span>
              </label>

              <a
                href="/forgot-password"
                className="text-sm font-semibold transition-opacity hover:opacity-75"
                style={{ color: "#065799" }}
              >
                Forgot password?
              </a>
            </div>

            {/* =================================================
                SIGN IN
            ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl px-4 py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background:
                  "linear-gradient(135deg, #F87828 0%, #ED6A1E 100%)",
                boxShadow: "0 7px 18px rgba(248, 120, 40, 0.24)",
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

          <div className="my-6 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "#E6DED5" }}
            />

            <span
              className="px-1 text-xs font-medium"
              style={{ color: "#999B96" }}
            >
              or
            </span>

            <div
              className="h-px flex-1"
              style={{ background: "#E6DED5" }}
            />
          </div>

          {/* Google */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-150 hover:bg-[#FAF7F2] disabled:opacity-60"
            style={{
              color: "#344E5C",
              background: "#FFFFFF",
              border: "1.5px solid #D9D6D0",
              boxShadow: "0 1px 3px rgba(80, 60, 40, 0.04)",
            }}
          >
            {googleLoading ? <LoadingSpinner /> : <GoogleIcon />}

            {googleLoading
              ? "Connecting..."
              : "Continue with Google"}
          </button>

          {/* Sign up */}

          <p
            className="mt-7 text-center text-sm"
            style={{ color: "#777D77" }}
          >
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-semibold transition-opacity hover:opacity-75"
              style={{ color: "#065799" }}
            >
              Sign up
            </a>
          </p>
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

/* ===============================================================
   EYE ICON
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

/* ===============================================================
   EYE OFF ICON
=============================================================== */

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

/* ===============================================================
   GOOGLE ICON
=============================================================== */

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

/* ===============================================================
   LOADING
=============================================================== */

function LoadingSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}
