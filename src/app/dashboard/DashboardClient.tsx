"use client";

import { useMemo, useState } from "react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TaskTable } from "@/components/dashboard/TaskTable";
import { TaskCalendar } from "@/components/dashboard/TaskCalendar";
import { TaskDialog } from "@/components/dashboard/TaskDialog";
import {
  tasks as initialTasks,
  getTaskSummary,
  type Task,
  type TaskStatus,
} from "@/components/dashboard/tasks-data";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DashboardClient() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const filtered = useMemo(
    () =>
      query.trim()
        ? tasks.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
        : tasks,
    [tasks, query],
  );

  const summary = getTaskSummary(tasks);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status, progress: status === "Completed" ? 100 : t.progress }
          : t,
      ),
    );
  };

  const handleSave = (task: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      return exists ? prev.map((t) => (t.id === task.id ? task : t)) : [task, ...prev];
    });
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Task Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your tasks, status, and schedule in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-9 w-64"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <SummaryCards
          total={summary.total}
          completed={summary.completed}
          inProgress={summary.inProgress}
          overdue={summary.overdue}
        />
        <TaskTable
          tasks={filtered}
          onStatusChange={handleStatusChange}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
        <TaskCalendar tasks={tasks} onSelectTask={openEdit} />
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
        task={editing}
      />
    </div>
  );
}