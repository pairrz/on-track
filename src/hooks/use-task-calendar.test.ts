import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  computeWeekBars,
  getBarColor,
  isOverdue,
} from "./use-task-calendar";

import type { Task } from "@/components/dashboard/tasks-data";

const FIXED_NOW = new Date(
  "2026-07-27T12:00:00.000Z",
);

function makeTask(
  overrides: Partial<Task> = {},
): Task {
  return {
    id: 1,
    title: "Sample task",
    description: null,
    status: "TODO",

    startAt: null,
    endAt: null,

    isAllDay: false,

    categoryId: null,
    category: null,

    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",

    ...overrides,
  };
}

const week = [
  new Date(2026, 6, 26),
  new Date(2026, 6, 27),
  new Date(2026, 6, 28),
  new Date(2026, 6, 29),
  new Date(2026, 6, 30),
  new Date(2026, 6, 31),
  new Date(2026, 7, 1),
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

/*
 * =====================================================
 * isOverdue
 * =====================================================
 */

describe("isOverdue", () => {
  it("returns false when endAt is null", () => {
    const task = makeTask({
      endAt: null,
    });

    expect(isOverdue(task)).toBe(false);
  });

  it("returns false when due date is today", () => {
    const task = makeTask({
      endAt: "2026-07-27T00:00:00.000Z",
    });

    expect(isOverdue(task)).toBe(false);
  });

  it("returns true when due date is yesterday", () => {
    const task = makeTask({
      endAt: "2026-07-26T00:00:00.000Z",
    });

    expect(isOverdue(task)).toBe(true);
  });

  it("returns false when due date is tomorrow", () => {
    const task = makeTask({
      endAt: "2026-07-28T00:00:00.000Z",
    });

    expect(isOverdue(task)).toBe(false);
  });

  it("returns false when task is DONE even if overdue", () => {
    const task = makeTask({
      status: "DONE",
      endAt: "2026-07-20T00:00:00.000Z",
    });

    expect(isOverdue(task)).toBe(false);
  });

  it("returns true for IN_PROGRESS task with past due date", () => {
    const task = makeTask({
      status: "IN_PROGRESS",
      endAt: "2026-07-20T00:00:00.000Z",
    });

    expect(isOverdue(task)).toBe(true);
  });

  it("returns true for CANCELLED task with past due date", () => {
    const task = makeTask({
      status: "CANCELLED",
      endAt: "2026-07-20T00:00:00.000Z",
    });

    expect(isOverdue(task)).toBe(true);
  });
});

/*
 * =====================================================
 * getBarColor
 * =====================================================
 */

describe("getBarColor", () => {
  it("returns category color when category exists", () => {
    const task = makeTask({
      category: {
        id: 1,
        name: "Work",
        color: "#ff0000",
      },
    });

    expect(getBarColor(task)).toBe("#ff0000");
  });

  it("returns default color when category is null", () => {
    const task = makeTask({
      category: null,
    });

    expect(getBarColor(task)).toBe("#94a3b8");
  });
});

/*
 * =====================================================
 * computeWeekBars
 * =====================================================
 */

describe("computeWeekBars", () => {
  it("returns empty array when week contains no valid dates", () => {
    expect(
      computeWeekBars(
        [null, null, null, null, null, null, null],
        [],
      ),
    ).toEqual([]);
  });

  it("returns empty array when there are no tasks", () => {
    expect(
      computeWeekBars(week, []),
    ).toEqual([]);
  });

  it("includes task inside the week", () => {
    const task = makeTask({
      startAt: "2026-07-27T00:00:00.000Z",
      endAt: "2026-07-29T00:00:00.000Z",
    });

    const result = computeWeekBars(
      week,
      [task],
    );

    expect(result).toHaveLength(1);

    expect(result[0]).toMatchObject({
      task,
      startCol: 1,
      endCol: 3,
      lane: 0,
    });
  });

  it("ignores task completely outside the week", () => {
    const task = makeTask({
      startAt: "2026-07-10T00:00:00.000Z",
      endAt: "2026-07-12T00:00:00.000Z",
    });

    expect(
      computeWeekBars(week, [task]),
    ).toEqual([]);
  });

  it("uses endAt as start date when startAt is missing", () => {
    const task = makeTask({
      startAt: null,
      endAt: "2026-07-29T00:00:00.000Z",
    });

    const result = computeWeekBars(
      week,
      [task],
    );

    expect(result[0]).toMatchObject({
      task,
      startCol: 3,
      endCol: 3,
      lane: 0,
    });
  });

  it("uses startAt as end date when endAt is missing", () => {
    const task = makeTask({
      startAt: "2026-07-29T00:00:00.000Z",
      endAt: null,
    });

    const result = computeWeekBars(
      week,
      [task],
    );

    expect(result[0]).toMatchObject({
      task,
      startCol: 3,
      endCol: 3,
      lane: 0,
    });
  });

  it("returns empty array when task has no dates", () => {
    const task = makeTask({
      startAt: null,
      endAt: null,
    });

    expect(
      computeWeekBars(week, [task]),
    ).toEqual([]);
  });

  it("clips task that starts before the week", () => {
    const task = makeTask({
      startAt: "2026-07-20T00:00:00.000Z",
      endAt: "2026-07-29T00:00:00.000Z",
    });

    const result = computeWeekBars(
      week,
      [task],
    );

    expect(result[0]).toMatchObject({
      startCol: 0,
      endCol: 3,
    });
  });

  it("clips task that ends after the week", () => {
    const task = makeTask({
      startAt: "2026-07-29T00:00:00.000Z",
      endAt: "2026-08-10T00:00:00.000Z",
    });

    const result = computeWeekBars(
      week,
      [task],
    );

    expect(result[0]).toMatchObject({
      startCol: 3,
      endCol: 6,
    });
  });

  it("handles reversed start and end dates", () => {
    const task = makeTask({
      startAt: "2026-07-30T00:00:00.000Z",
      endAt: "2026-07-28T00:00:00.000Z",
    });

    const result = computeWeekBars(
      week,
      [task],
    );

    expect(result[0]).toMatchObject({
      startCol: 2,
      endCol: 4,
      lane: 0,
    });
  });

  it("assigns different lanes to overlapping tasks", () => {
    const task1 = makeTask({
      id: 1,
      startAt: "2026-07-27T00:00:00.000Z",
      endAt: "2026-07-29T00:00:00.000Z",
    });

    const task2 = makeTask({
      id: 2,
      startAt: "2026-07-28T00:00:00.000Z",
      endAt: "2026-07-30T00:00:00.000Z",
    });

    const result = computeWeekBars(
      week,
      [task1, task2],
    );

    expect(result).toHaveLength(2);

    expect(result[0].lane).toBe(0);
    expect(result[1].lane).toBe(1);
  });

  it("reuses a lane when tasks do not overlap", () => {
    const task1 = makeTask({
      id: 1,
      startAt: "2026-07-27T00:00:00.000Z",
      endAt: "2026-07-28T00:00:00.000Z",
    });

    const task2 = makeTask({
      id: 2,
      startAt: "2026-07-29T00:00:00.000Z",
      endAt: "2026-07-30T00:00:00.000Z",
    });

    const result = computeWeekBars(
      week,
      [task1, task2],
    );

    expect(result).toHaveLength(2);

    expect(result[0].lane).toBe(0);
    expect(result[1].lane).toBe(0);
  });

  it("supports a single-day task", () => {
    const task = makeTask({
      startAt: "2026-07-28T00:00:00.000Z",
      endAt: "2026-07-28T00:00:00.000Z",
    });

    const result = computeWeekBars(
      week,
      [task],
    );

    expect(result[0]).toMatchObject({
      startCol: 2,
      endCol: 2,
      lane: 0,
    });
  });
});