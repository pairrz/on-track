import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getTaskSummary, statusLabels, type Task } from "./tasks-data";

// Fixed "now" so overdue calculations are deterministic regardless of when
// this test suite actually runs (per checklist item 4).
const FIXED_NOW = new Date("2026-07-27T12:00:00.000Z");

function makeTask(overrides: Partial<Task> = {}): Task {
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

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getTaskSummary", () => {
  it("returns all zeros for an empty list", () => {
    expect(getTaskSummary([])).toEqual({
      total: 0,
      completed: 0,
      inProgress: 0,
      overdue: 0,
    });
  });

  it("counts total, completed (DONE), and inProgress (IN_PROGRESS) correctly", () => {
    const tasks: Task[] = [
      makeTask({ id: 1, status: "DONE" }),
      makeTask({ id: 2, status: "DONE" }),
      makeTask({ id: 3, status: "IN_PROGRESS" }),
      makeTask({ id: 4, status: "TODO" }),
      makeTask({ id: 5, status: "CANCELLED" }),
    ];

    const summary = getTaskSummary(tasks);
    expect(summary.total).toBe(5);
    expect(summary.completed).toBe(2);
    expect(summary.inProgress).toBe(1);
  });

  it("marks a task overdue when endAt is in the past and status is not DONE", () => {
    const tasks: Task[] = [
      makeTask({ id: 1, status: "TODO", endAt: "2026-07-20T00:00:00.000Z" }),
    ];

    expect(getTaskSummary(tasks).overdue).toBe(1);
  });

  it("does NOT mark a task overdue if status is DONE, even if endAt is in the past", () => {
    const tasks: Task[] = [
      makeTask({ id: 1, status: "DONE", endAt: "2026-07-20T00:00:00.000Z" }),
    ];

    expect(getTaskSummary(tasks).overdue).toBe(0);
  });

  it("does NOT mark a task overdue if endAt is in the future", () => {
    const tasks: Task[] = [
      makeTask({ id: 1, status: "TODO", endAt: "2026-08-01T00:00:00.000Z" }),
    ];

    expect(getTaskSummary(tasks).overdue).toBe(0);
  });

  it("does NOT mark a task overdue if endAt is null", () => {
    const tasks: Task[] = [makeTask({ id: 1, status: "TODO", endAt: null })];

    expect(getTaskSummary(tasks).overdue).toBe(0);
  });

  it("does NOT mark a CANCELLED task overdue-excluded status as overdue-safe (only DONE is excluded)", () => {
    // Documents current behavior: CANCELLED tasks with a past endAt ARE counted
    // as overdue, since the implementation only excludes status === "DONE".
    const tasks: Task[] = [
      makeTask({ id: 1, status: "CANCELLED", endAt: "2026-07-20T00:00:00.000Z" }),
    ];

    expect(getTaskSummary(tasks).overdue).toBe(1);
  });

  it("total always equals the input list length regardless of status mix", () => {
    const tasks: Task[] = [
      makeTask({ id: 1, status: "TODO" }),
      makeTask({ id: 2, status: "TODO" }),
      makeTask({ id: 3, status: "TODO" }),
    ];

    expect(getTaskSummary(tasks).total).toBe(3);
  });

  it("decreases total by exactly 1 when a task is removed", () => {
    const before = getTaskSummary([
      makeTask({ id: 1, status: "DONE" }),
      makeTask({ id: 2, status: "IN_PROGRESS" }),
    ]);
    const after = getTaskSummary([makeTask({ id: 2, status: "IN_PROGRESS" })]);

    expect(before.total - after.total).toBe(1);
    expect(before.completed - after.completed).toBe(1);
    expect(after.inProgress).toBe(1);
  });
});

describe("statusLabels", () => {
  it("contains a label for every TaskStatus value", () => {
    expect(statusLabels.TODO).toBe("To do");
    expect(statusLabels.IN_PROGRESS).toBe("In Progress");
    expect(statusLabels.DONE).toBe("Done");
    expect(statusLabels.CANCELLED).toBe("Cancelled");
  });

  it("has exactly 4 keys, matching the TaskStatus union with no extras or omissions", () => {
    expect(Object.keys(statusLabels).sort()).toEqual(
      ["CANCELLED", "DONE", "IN_PROGRESS", "TODO"].sort(),
    );
  });
});