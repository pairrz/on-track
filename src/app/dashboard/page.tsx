import type { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Task Dashboard – Track work, status & schedule",
  description:
    "A modern task management dashboard to track tasks, monitor status and progress, and view scheduled work on a monthly calendar.",
  openGraph: {
    title: "Task Dashboard – Track work, status & schedule",
    description:
      "Monitor tasks, priorities, progress, and due dates in a clean task management dashboard.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}