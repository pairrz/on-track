"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "./tasks-data";

const statusDot: Record<TaskStatus, string> = {
  Completed: "bg-emerald-500",
  "In Progress": "bg-blue-500",
  "Not Started": "bg-slate-400",
  Overdue: "bg-red-500",
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function TaskCalendar({
  tasks,
  onSelectTask,
}: {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}) {
  const [cursor, setCursor] = useState(new Date(2026, 6, 1)); // July 2026

  const { weeks, monthLabel } = useMemo(() => {
    const first = startOfMonth(cursor);
    const startDay = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (days.length % 7 !== 0) days.push(null);
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return {
      weeks,
      monthLabel: cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  }, [cursor]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const key = t.dueDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  const todayKey = new Date().toISOString().slice(0, 10);

  function keyOf(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Schedule</h2>
          <p className="text-sm text-muted-foreground">Tasks displayed on their due dates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-semibold min-w-[140px] text-center">{monthLabel}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-xs font-medium text-muted-foreground text-center py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeks.flat().map((day, idx) => {
            if (!day) return <div key={idx} className="min-h-[96px] rounded-lg bg-muted/20" />;
            const k = keyOf(day);
            const dayTasks = tasksByDate.get(k) ?? [];
            const isToday = k === todayKey;
            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[96px] rounded-lg border p-2 flex flex-col gap-1 transition hover:border-primary/40 hover:bg-muted/30",
                  isToday && "border-primary bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isToday ? "text-primary" : "text-foreground",
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {dayTasks.slice(0, 2).map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => onSelectTask?.(t)}
                      className="flex items-center gap-1.5 rounded px-1.5 py-1 bg-muted/60 hover:bg-muted text-[11px] truncate text-left transition-colors"
                      title={`Edit ${t.name}`}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusDot[t.status])} />
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                  {dayTasks.length > 2 && (
                    <span className="text-[10px] text-muted-foreground pl-1">
                      +{dayTasks.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {(Object.keys(statusDot) as TaskStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", statusDot[s])} />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
