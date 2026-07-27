"use client";

import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

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
    <div className="overflow-hidden rounded-2xl border border-[#065799]/10 bg-white shadow-lg shadow-[#065799]/5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#065799]/10 bg-gradient-to-r from-[#065799] via-[#0874c4] to-[#7F9C87] px-6 py-5">
        <div>
          <h2 className="text-xl font-black text-white">
            Calendar
          </h2>

          <p className="mt-1 text-sm text-white/75">
            Tasks and work schedule
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevMonth}
            className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-[150px] rounded-lg bg-white/15 px-4 py-2 text-center text-sm font-bold text-white backdrop-blur">
            {monthLabel}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Week days */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((d) => (
            <div
              key={d}
              className="rounded-lg bg-[#065799]/5 py-2 text-center text-xs font-black text-[#065799]"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="flex flex-col gap-1">
          {weeks.map((week, weekIdx) => {
            const bars = computeWeekBars(
              week,
              tasks,
            );

            const maxLane =
              bars.length > 0
                ? Math.max(
                    ...bars.map(
                      (b) => b.lane,
                    ),
                  ) + 1
                : 0;

            const rowHeight =
              HEADER_HEIGHT +
              maxLane * LANE_HEIGHT +
              CELL_PADDING;

            return (
              <div
                key={weekIdx}
                className="relative"
              >
                <div className="grid grid-cols-7 gap-1">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={dayIdx}
                          className="rounded-lg bg-slate-50"
                          style={{
                            height: rowHeight,
                          }}
                        />
                      );
                    }

                    const isToday =
                      keyOf(day) === todayKey;

                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          "rounded-lg border border-slate-100 bg-white p-2 transition-all hover:border-[#065799]/30 hover:bg-[#065799]/5",
                          isToday &&
                            "border-[#F87828] bg-[#F87828]/5 ring-2 ring-[#F87828]/30",
                        )}
                        style={{
                          height: rowHeight,
                        }}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-black",
                            isToday
                              ? "bg-[#F87828] text-white"
                              : "text-slate-600",
                          )}
                        >
                          {day.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {bars.map((bar) => {
                  const overdue = isOverdue(
                    bar.task,
                  );

                  const color = getBarColor(
                    bar.task,
                  );

                  return (
                    <button
                      key={`${bar.task.id}-${bar.startCol}`}
                      type="button"
                      onClick={() =>
                        onSelectTask?.(
                          bar.task,
                        )
                      }
                      title={bar.task.title}
                      className={cn(
                        "absolute flex items-center gap-1 rounded-md px-2 text-[11px] font-bold text-white shadow-md transition-all hover:z-20 hover:scale-[1.02] hover:shadow-lg",
                        overdue &&
                          "ring-2 ring-[#F87828] ring-offset-1",
                      )}
                      style={{
                        left: `calc(${(bar.startCol / 7) * 100}% + 2px)`,
                        width: `calc(${((bar.endCol - bar.startCol + 1) / 7) * 100}% - 4px)`,
                        top:
                          HEADER_HEIGHT +
                          bar.lane *
                            LANE_HEIGHT,
                        height:
                          LANE_HEIGHT - 4,
                        backgroundColor:
                          color,
                      }}
                    >
                      {overdue && (
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                      )}

                      <span className="truncate">
                        {bar.task.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3 rounded-xl bg-slate-50 p-4 text-xs">
          {categoryLegend.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: c.color,
                }}
              />

              <span className="font-medium text-slate-600">
                {c.name}
              </span>
            </div>
          ))}

          <div className="flex items-center gap-2 rounded-full bg-[#F87828]/10 px-3 py-1.5 font-bold text-[#F87828]">
            <AlertTriangle className="h-3 w-3" />
            Overdue
          </div>
        </div>
      </div>
    </div>
  );
}