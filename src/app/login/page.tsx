// src/app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  OAuthAccountNotLinked:
    "อีเมลนี้เคยสมัครด้วยวิธีอื่นแล้ว กรุณาล็อกอินด้วยวิธีเดิม",
  Default: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
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
    } else if (res?.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded">
      <h1 className="text-xl font-bold mb-4">เข้าสู่ระบบ</h1>

      <form onSubmit={handleCredentialsLogin} className="space-y-3">
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>

      <div className="my-4 text-center text-gray-400">หรือ</div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full border p-2 rounded flex items-center justify-center gap-2"
      >
        เข้าสู่ระบบด้วย Google
      </button>
    </div>
  );
}