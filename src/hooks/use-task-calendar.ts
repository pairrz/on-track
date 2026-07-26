"use client";

import { useMemo, useState } from "react";
import type { Task } from "@/components/dashboard/tasks-data";

const NO_CATEGORY_COLOR = "#94a3b8";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function toDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function isOverdue(task: Task) {
  if (!task.endAt) return false;
  return new Date(task.endAt) < new Date() && task.status !== "DONE";
}

export function getBarColor(task: Task) {
  return task.category?.color ?? NO_CATEGORY_COLOR;
}

export interface WeekBar {
  task: Task;
  startCol: number;
  endCol: number;
  lane: number;
}

export function computeWeekBars(week: (Date | null)[], tasks: Task[]): WeekBar[] {
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

export function useTaskCalendar(tasks: Task[]) {
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

  const goToPrevMonth = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));

  const goToNextMonth = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  const todayKey = new Date().toISOString().slice(0, 10);

  function keyOf(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  return {
    weeks,
    monthLabel,
    categoryLegend,
    todayKey,
    keyOf,
    goToPrevMonth,
    goToNextMonth,
  };
}