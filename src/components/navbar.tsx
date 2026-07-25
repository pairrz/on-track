"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import LogoutButton from "./logout-button";

export default function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return <nav>กำลังโหลด...</nav>;

  return (
    <nav className="flex justify-between p-4 border-b">
      <Link href="/">On-Track</Link>
      {session ? (
        <div className="flex items-center gap-4">
          <span>สวัสดี {session.user?.name}</span>
          <LogoutButton />
        </div>
      ) : (
        <Link href="/login">เข้าสู่ระบบ</Link>
      )}
    </nav>
  );
}