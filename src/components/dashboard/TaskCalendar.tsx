"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "./tasks-data";

const LANE_HEIGHT = 22;
const HEADER_HEIGHT = 28;
const CELL_PADDING = 8;
const NO_CATEGORY_COLOR = "#94a3b8";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function toDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isOverdue(task: Task) {
  if (!task.endAt) return false;
  return new Date(task.endAt) < new Date() && task.status !== "DONE";
}

function getBarColor(task: Task) {
  return task.category?.color ?? NO_CATEGORY_COLOR;
}

interface WeekBar {
  task: Task;
  startCol: number;
  endCol: number;
  lane: number;
}

function computeWeekBars(week: (Date | null)[], tasks: Task[]): WeekBar[] {
  const validDays = week.filter((d): d is Date => d !== null);
  if (validDays.length === 0) return [];

  const weekStartTime = toDateOnly(validDays[0]);
  const weekEndTime = toDateOnly(validDays[validDays.length - 1]);

  const relevant = tasks
    .map((t) => {
      const endSource = t.endAt ?? t.startAt;
      if (!endSource) return null;

      const end = toDateOnly(new Date(endSource));
      const start = t.startAt ? toDateOnly(new Date(t.startAt)) : end;

      const actualStart = Math.min(start, end);
      const actualEnd = Math.max(start, end);

      if (actualEnd < weekStartTime || actualStart > weekEndTime) return null;

      const clippedStart = Math.max(actualStart, weekStartTime);
      const clippedEnd = Math.min(actualEnd, weekEndTime);

      return {
        task: t,
        startCol: Math.round((clippedStart - weekStartTime) / 86400000),
        endCol: Math.round((clippedEnd - weekStartTime) / 86400000),
      };
    })
    .filter((x): x is { task: Task; startCol: number; endCol: number } => x !== null)
    .sort((a, b) => a.startCol - b.startCol || a.endCol - b.endCol);

  const laneEndCols: number[] = [];
  const bars: WeekBar[] = [];

  for (const item of relevant) {
    let laneIndex = laneEndCols.findIndex((endCol) => endCol < item.startCol);
    if (laneIndex === -1) {
      laneIndex = laneEndCols.length;
      laneEndCols.push(item.endCol);
    } else {
      laneEndCols[laneIndex] = item.endCol;
    }
    bars.push({ ...item, lane: laneIndex });
  }

  return bars;
}

export function TaskCalendar({
  tasks,
  onSelectTask,
}: {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}) {
  const [cursor, setCursor] = useState(new Date(2026, 6, 1));

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

  const categoryLegend = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    let hasUncategorized = false;

    for (const t of tasks) {
      if (t.category) {
        map.set(String(t.category.id), { name: t.category.name, color: t.category.color });
      } else {
        hasUncategorized = true;
      }
    }

    const list = Array.from(map.values());
    if (hasUncategorized) {
      list.push({ name: "ไม่มีหมวด", color: NO_CATEGORY_COLOR });
    }
    return list;
  }, [tasks]);

  const todayKey = new Date().toISOString().slice(0, 10);

  function keyOf(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Calendar</h2>
          <p className="text-sm text-muted-foreground">Tasks and work schedule </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-semibold min-w-[140px] text-center">{monthLabel}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-xs font-medium text-muted-foreground text-center py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {weeks.map((week, weekIdx) => {
            const bars = computeWeekBars(week, tasks);
            const maxLane = bars.length > 0 ? Math.max(...bars.map((b) => b.lane)) + 1 : 0;
            const rowHeight = HEADER_HEIGHT + maxLane * LANE_HEIGHT + CELL_PADDING;

            return (
              <div key={weekIdx} className="relative">
                <div className="grid grid-cols-7 gap-1">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={dayIdx}
                          className="rounded-lg bg-muted/20"
                          style={{ height: rowHeight }}
                        />
                      );
                    }
                    const isToday = keyOf(day) === todayKey;
                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          "rounded-lg border p-1",
                          isToday && "ring-2 ring-primary ring-offset-1",
                        )}
                        style={{ height: rowHeight }}
                      >
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            isToday ? "text-primary" : "text-foreground",
                          )}
                        >
                          {day.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {bars.map((bar) => {
                  const overdue = isOverdue(bar.task);
                  const color = getBarColor(bar.task);
                  return (
                    <button
                      key={`${bar.task.id}-${bar.startCol}`}
                      type="button"
                      onClick={() => onSelectTask?.(bar.task)}
                      title={
                        overdue ? `${bar.task.title}` : bar.task.title
                      }
                      className={cn(
                        "absolute flex items-center gap-1 rounded px-1.5 text-[11px] font-medium text-white truncate transition-opacity hover:opacity-80",
                        overdue && "ring-2 ring-red-500 ring-offset-1",
                      )}
                      style={{
                        left: `calc(${(bar.startCol / 7) * 100}% + 2px)`,
                        width: `calc(${((bar.endCol - bar.startCol + 1) / 7) * 100}% - 4px)`,
                        top: HEADER_HEIGHT + bar.lane * LANE_HEIGHT,
                        height: LANE_HEIGHT - 4,
                        backgroundColor: color,
                      }}
                    >
                      {overdue && <AlertTriangle className="h-3 w-3 shrink-0" />}
                      <span className="truncate">{bar.task.title}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {categoryLegend.map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.name}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            Overdue
          </div>
        </div>
      </div>
    </div>
  );
}