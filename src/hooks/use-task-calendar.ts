"use client";

import { useMemo, useState } from "react";
import type { Task } from "@/components/dashboard/tasks-data";

const NO_CATEGORY_COLOR = "#94a3b8";
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Convert date/ISO string to local date only.
 *
 * IMPORTANT:
 * We intentionally read YYYY-MM-DD directly from ISO strings
 * so timezone conversion does not move the task to another day.
 */
function toDateOnly(value: Date | string): number {
  if (typeof value === "string") {
    const datePart = value.slice(0, 10);
    const [year, month, day] = datePart.split("-").map(Number);

    return new Date(year, month - 1, day).getTime();
  }

  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
  ).getTime();
}

/**
 * Check whether a task is overdue.
 *
 * Today:
 *   2026-07-27 -> NOT overdue
 *
 * Yesterday:
 *   2026-07-26 -> overdue
 *
 * DONE:
 *   never overdue
 */
export function isOverdue(task: Task): boolean {
  if (!task.endAt) {
    return false;
  }

  if (task.status === "DONE") {
    return false;
  }

  const endDate = toDateOnly(task.endAt);
  const today = toDateOnly(new Date());

  return endDate < today;
}

/**
 * Get task bar color.
 */
export function getBarColor(task: Task): string {
  return task.category?.color ?? NO_CATEGORY_COLOR;
}

export interface WeekBar {
  task: Task;
  startCol: number;
  endCol: number;
  lane: number;
}

/**
 * Calculate task bars for one calendar week.
 *
 * startCol:
 *   0 = Sunday
 *   1 = Monday
 *   ...
 *   6 = Saturday
 */
export function computeWeekBars(
  week: (Date | null)[],
  tasks: Task[],
): WeekBar[] {
  const validDays = week.filter(
    (day): day is Date => day !== null,
  );

  if (validDays.length === 0) {
    return [];
  }

  const weekStart = toDateOnly(validDays[0]);
  const weekEnd = toDateOnly(
    validDays[validDays.length - 1],
  );

  const relevant = tasks
    .map((task) => {
      /*
       * If there is no start/end date,
       * the task cannot be shown on calendar.
       */
      if (!task.startAt && !task.endAt) {
        return null;
      }

      /*
       * If only endAt exists,
       * use endAt as start date.
       */
      const startSource = task.startAt ?? task.endAt;

      /*
       * If only startAt exists,
       * use startAt as end date.
       */
      const endSource = task.endAt ?? task.startAt;

      if (!startSource || !endSource) {
        return null;
      }

      const start = toDateOnly(startSource);
      const end = toDateOnly(endSource);

      /*
       * Protect against start/end being reversed.
       */
      const actualStart = Math.min(start, end);
      const actualEnd = Math.max(start, end);

      /*
       * Task is completely outside this week.
       */
      if (
        actualEnd < weekStart ||
        actualStart > weekEnd
      ) {
        return null;
      }

      /*
       * Clip task to this week.
       */
      const clippedStart = Math.max(
        actualStart,
        weekStart,
      );

      const clippedEnd = Math.min(
        actualEnd,
        weekEnd,
      );

      const startCol = Math.round(
        (clippedStart - weekStart) / DAY_MS,
      );

      const endCol = Math.round(
        (clippedEnd - weekStart) / DAY_MS,
      );

      return {
        task,
        startCol,
        endCol,
      };
    })
    .filter(
      (
        item,
      ): item is {
        task: Task;
        startCol: number;
        endCol: number;
      } => item !== null,
    )
    .sort((a, b) => {
      /*
       * Sort by starting date first.
       * If same date, shorter task first.
       */
      return (
        a.startCol - b.startCol ||
        a.endCol - b.endCol
      );
    });

  /*
   * Keep track of the last column occupied by each lane.
   */
  const laneEndCols: number[] = [];

  const bars: WeekBar[] = [];

  for (const item of relevant) {
    /*
     * Reuse the first lane whose previous task
     * ends before this task starts.
     */
    let laneIndex = laneEndCols.findIndex(
      (endCol) => endCol < item.startCol,
    );

    /*
     * No available lane -> create a new one.
     */
    if (laneIndex === -1) {
      laneIndex = laneEndCols.length;
      laneEndCols.push(item.endCol);
    } else {
      laneEndCols[laneIndex] = item.endCol;
    }

    bars.push({
      ...item,
      lane: laneIndex,
    });
  }

  return bars;
}

export function useTaskCalendar(tasks: Task[]) {
  /*
   * Start at current month.
   */
  const [cursor, setCursor] = useState(() => {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );
  });

  /*
   * Generate calendar days.
   */
  const { weeks, monthLabel } = useMemo(() => {
    const first = startOfMonth(cursor);

    const startDay = first.getDay();

    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
    ).getDate();

    const days: (Date | null)[] = [];

    /*
     * Empty cells before first day.
     */
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    /*
     * Actual days.
     */
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          day,
        ),
      );
    }

    /*
     * Complete the last week.
     */
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    const result: (Date | null)[][] = [];

    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }

    return {
      weeks: result,
      monthLabel: cursor.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        },
      ),
    };
  }, [cursor]);

  /*
   * Category legend.
   */
  const categoryLegend = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        color: string;
      }
    >();

    let hasUncategorized = false;

    for (const task of tasks) {
      if (task.category) {
        map.set(String(task.category.id), {
          name: task.category.name,
          color: task.category.color,
        });
      } else {
        hasUncategorized = true;
      }
    }

    const result = Array.from(map.values());

    if (hasUncategorized) {
      result.push({
        name: "ไม่มีหมวด",
        color: NO_CATEGORY_COLOR,
      });
    }

    return result;
  }, [tasks]);

  /*
   * Previous month.
   */
  const goToPrevMonth = () => {
    setCursor((current) => {
      return new Date(
        current.getFullYear(),
        current.getMonth() - 1,
        1,
      );
    });
  };

  /*
   * Next month.
   */
  const goToNextMonth = () => {
    setCursor((current) => {
      return new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        1,
      );
    });
  };

  /*
   * Today's date key.
   */
  const today = new Date();

  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  /*
   * Convert Date -> YYYY-MM-DD.
   */
  function keyOf(date: Date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
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