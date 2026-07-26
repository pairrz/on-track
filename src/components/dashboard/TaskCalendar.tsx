"use client";

import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "./tasks-data";
import {
  useTaskCalendar,
  computeWeekBars,
  isOverdue,
  getBarColor,
} from "@/hooks/use-task-calendar";

const LANE_HEIGHT = 22;
const HEADER_HEIGHT = 28;
const CELL_PADDING = 8;

export function TaskCalendar({
  tasks,
  onSelectTask,
}: {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}) {
  const {
    weeks,
    monthLabel,
    categoryLegend,
    todayKey,
    keyOf,
    goToPrevMonth,
    goToNextMonth,
  } = useTaskCalendar(tasks);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Calendar</h2>
          <p className="text-sm text-muted-foreground">Tasks and work schedule </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-semibold min-w-[140px] text-center">{monthLabel}</div>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
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
                      title={bar.task.title}
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
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
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