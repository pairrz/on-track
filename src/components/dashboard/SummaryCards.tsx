"use client";

import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export function SummaryCards({
  total,
  completed,
  inProgress,
  overdue,
}: SummaryCardsProps) {
  const completionRate =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  const cards = [
    {
      label: "Total Tasks",
      value: total,
      icon: ListTodo,
      description: "All active tasks",
      card:
        "border-[#065799]/20 bg-gradient-to-br from-[#065799] to-[#0874c4]",
      iconBox: "bg-white/20 text-white",
      text: "text-white",
      subtext: "text-white/75",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      description: `${completionRate}% completion rate`,
      card:
        "border-[#7F9C87]/30 bg-gradient-to-br from-[#7F9C87] to-[#5f806b]",
      iconBox: "bg-white/20 text-white",
      text: "text-white",
      subtext: "text-white/75",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      description: "Currently active",
      card:
        "border-[#D3B7A6]/40 bg-gradient-to-br from-[#D3B7A6] to-[#b9957f]",
      iconBox: "bg-white/25 text-white",
      text: "text-white",
      subtext: "text-white/80",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertTriangle,
      description: "Needs attention",
      card:
        "border-[#F87828]/30 bg-gradient-to-br from-[#F87828] to-[#e94f13]",
      iconBox: "bg-white/20 text-white",
      text: "text-white",
      subtext: "text-white/80",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(
        ({
          label,
          value,
          icon: Icon,
          description,
          card,
          iconBox,
          text,
          subtext,
        }) => (
          <div
            key={label}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-6 shadow-lg transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-2xl",
              card,
            )}
          >
            {/* Decorative circle */}
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={cn(
                      "text-sm font-bold tracking-wide",
                      subtext,
                    )}
                  >
                    {label}
                  </p>

                  <p
                    className={cn(
                      "mt-2 text-4xl font-black tracking-tight",
                      text,
                    )}
                  >
                    {value}
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-xl p-3 shadow-sm",
                    iconBox,
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p
                  className={cn(
                    "text-xs font-medium",
                    subtext,
                  )}
                >
                  {description}
                </p>

                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#065799]" />
                </div>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}