export type TaskStatus = "Completed" | "In Progress" | "Not Started" | "Overdue";
export type TaskPriority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string; // ISO
  dueDate: string; // ISO
  progress: number;
}

export const tasks: Task[] = [
  { id: "1", name: "Design Homepage", status: "In Progress", priority: "High", startDate: "2026-07-25", dueDate: "2026-07-28", progress: 60 },
  { id: "2", name: "Implement Auth Flow", status: "Completed", priority: "High", startDate: "2026-07-15", dueDate: "2026-07-22", progress: 100 },
  { id: "3", name: "Write API Documentation", status: "Overdue", priority: "Medium", startDate: "2026-07-10", dueDate: "2026-07-20", progress: 45 },
  { id: "4", name: "Setup CI/CD Pipeline", status: "In Progress", priority: "Medium", startDate: "2026-07-22", dueDate: "2026-07-30", progress: 35 },
  { id: "5", name: "User Research Interviews", status: "Completed", priority: "Low", startDate: "2026-07-05", dueDate: "2026-07-18", progress: 100 },
  { id: "6", name: "Onboarding Redesign", status: "Not Started", priority: "Medium", startDate: "2026-07-29", dueDate: "2026-08-05", progress: 0 },
  { id: "7", name: "Fix Checkout Bug", status: "Overdue", priority: "High", startDate: "2026-07-18", dueDate: "2026-07-23", progress: 70 },
  { id: "8", name: "Migrate Database", status: "In Progress", priority: "High", startDate: "2026-07-24", dueDate: "2026-07-31", progress: 25 },
  { id: "9", name: "Q3 Marketing Plan", status: "Completed", priority: "Low", startDate: "2026-07-01", dueDate: "2026-07-15", progress: 100 },
  { id: "10", name: "Mobile App Prototype", status: "In Progress", priority: "Medium", startDate: "2026-07-20", dueDate: "2026-08-02", progress: 55 },
  { id: "11", name: "Accessibility Audit", status: "Not Started", priority: "Low", startDate: "2026-07-30", dueDate: "2026-08-08", progress: 0 },
  { id: "12", name: "Refactor Billing Module", status: "Overdue", priority: "High", startDate: "2026-07-12", dueDate: "2026-07-24", progress: 80 },
];

export function getTaskSummary(list: Task[]) {
  return {
    total: list.length,
    completed: list.filter((t) => t.status === "Completed").length,
    inProgress: list.filter((t) => t.status === "In Progress").length,
    overdue: list.filter((t) => t.status === "Overdue").length,
  };
}
