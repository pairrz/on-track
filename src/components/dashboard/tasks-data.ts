export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

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

export function getTaskSummary(tasks: Task[]) {
  const now = new Date();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdue = tasks.filter(
    (t) => t.endAt && new Date(t.endAt) < now && t.status !== "DONE"
  ).length;

  return { total, completed, inProgress, overdue };
}

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  CANCELLED: "Cancelled",
};