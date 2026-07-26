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
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-gray-900 tracking-tight"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Create your account
        </h1>

        <p className="mt-2 text-[15px] text-gray-500 leading-relaxed">
          Sign up to start managing your work with OnTrack.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1.5"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
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
            required
            className="w-full px-4 py-3 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-150"
            style={{
              border: "1.5px solid #e5e7eb",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              background: "#fafafa",
              fontFamily: "'Inter', sans-serif",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1.5px solid #6366f1";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(99,102,241,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1.5px solid #e5e7eb";
              e.currentTarget.style.boxShadow =
                "0 1px 2px rgba(0,0,0,0.04)";
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1.5"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
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
            required
            className="w-full px-4 py-3 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-150"
            style={{
              border: "1.5px solid #e5e7eb",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              background: "#fafafa",
              fontFamily: "'Inter', sans-serif",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1.5px solid #6366f1";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(99,102,241,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1.5px solid #e5e7eb";
              e.currentTarget.style.boxShadow =
                "0 1px 2px rgba(0,0,0,0.04)";
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
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
              required
              minLength={8}
              className="w-full px-4 py-3 pr-12 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-150"
              style={{
                border: "1.5px solid #e5e7eb",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                background: "#fafafa",
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1.5px solid #6366f1";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(99,102,241,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1.5px solid #e5e7eb";
                e.currentTarget.style.boxShadow =
                  "0 1px 2px rgba(0,0,0,0.04)";
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

          <p className="mt-1.5 text-xs text-gray-400">
            Password must be at least 8 characters.
          </p>
        </div>

        {/* Register */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl text-white text-[15px] font-semibold transition-all duration-150 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* Sign in */}
      <p
        className="mt-8 text-center text-sm text-gray-500"
        style={{
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Already have an account?{" "}
        <a
          href="/login"
          className="font-semibold transition-colors"
          style={{
            color: "#4f46e5",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Sign in
        </a>
      </p>
    </div>
  );
}

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
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}