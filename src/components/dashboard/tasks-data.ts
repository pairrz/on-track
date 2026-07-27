export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED";

export type Category = {
  id: number;
  name: string;
  color: string;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  startAt: string | null;
  endAt: string | null;
  isAllDay: boolean;
  categoryId: number | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
};

/*
 * Get YYYY-MM-DD from a task date.
 *
 * Important:
 * - Date-only value: use it directly
 * - ISO timestamp: convert to user's local date
 *
 * This prevents an All Day task from becoming
 * "yesterday" because of UTC timezone conversion.
 */
function getDateKey(value: string | Date): string {
  if (typeof value === "string") {
    // Date-only value: 2026-07-27
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 * Check whether task is overdue.
 *
 * Today     -> NOT overdue
 * Yesterday -> Overdue
 * Tomorrow  -> NOT overdue
 * DONE      -> NOT overdue
 * No due date -> NOT overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.endAt) {
    return false;
  }

  if (task.status === "DONE") {
    return false;
  }

  const dueDate = getDateKey(task.endAt);
  const today = getDateKey(new Date());

  if (!dueDate || !today) {
    return false;
  }

  return dueDate < today;
}

export function getTaskSummary(tasks: Task[]) {
  const total = tasks.length;

  const completed = tasks.filter(
    (task) => task.status === "DONE",
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;

  const overdue = tasks.filter(
    (task) => isTaskOverdue(task),
  ).length;

  return {
    total,
    completed,
    inProgress,
    overdue,
  };
}

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  CANCELLED: "Cancelled",
};