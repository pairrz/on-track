"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (loginRes?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}

      <div className="mb-7">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#065799",
          }}
        >
          Create your account
        </h1>

        <p
          className="mt-2 text-[15px] leading-relaxed"
          style={{ color: "#747A75" }}
        >
          Sign up to start managing your work with OnTrack.
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

      {/* Form */}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}

        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-semibold"
            style={{ color: "#344E5C" }}
          >
            Name
          </label>

          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            required
            className="w-full rounded-xl px-4 py-3 text-[15px] outline-none transition-all duration-150"
            style={{
              color: "#163B50",
              background: "#FFFCF8",
              border: nameFocused
                ? "1.5px solid #7F9C87"
                : "1.5px solid #D8D5CF",
              boxShadow: nameFocused
                ? "0 0 0 4px rgba(127, 156, 135, 0.13)"
                : "0 1px 2px rgba(80, 60, 40, 0.03)",
            }}
          />
        </div>

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
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
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
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
              minLength={8}
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

          <p
            className="mt-1.5 text-xs"
            style={{ color: "#999B96" }}
          >
            Password must be at least 8 characters.
          </p>
        </div>

        {/* Create Account */}

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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* Sign in */}

      <p
        className="mt-7 text-center text-sm"
        style={{ color: "#777D77" }}
      >
        Already have an account?{" "}
        <a
          href="/login"
          className="font-semibold transition-opacity hover:opacity-75"
          style={{ color: "#065799" }}
        >
          Sign in
        </a>
      </p>
    </div>
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
    </svg>
  );
}

