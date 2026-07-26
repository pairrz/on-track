"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TaskTable } from "@/components/dashboard/TaskTable";
import { TaskCalendar } from "@/components/dashboard/TaskCalendar";
import { TaskDialog } from "@/components/dashboard/TaskDialog";
import { getTaskSummary, type Task, type TaskStatus } from "@/components/dashboard/tasks-data";
import { Button } from "@/components/ui/button";
import { Plus, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data.tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const filtered = useMemo(
    () =>
      query.trim()
        ? tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
        : tasks,
    [tasks, query],
  );

  const summary = getTaskSummary(tasks);

  const handleStatusChange = async (id: number, status: TaskStatus) => {
  const prevTasks = tasks;

  setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

  try {
    const res = await fetch("/api/task", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) throw new Error("Failed to update status");
  } catch (err) {
    setTasks(prevTasks);
  }
};

  const handleSave = async (task: Task) => {
  const isNew = !tasks.some((t) => t.id === task.id);

  try {
    const res = await fetch("/api/task", {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!res.ok) throw new Error("Failed to save task");

    const saved = await res.json();

    setTasks((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [saved, ...prev];
    });
  } catch (err) {
    console.error(err);
  }
};

  const handleDelete = async (id: number) => {
  const prevTasks = tasks;

  setTasks((prev) => prev.filter((t) => t.id !== id));

  try {
    const res = await fetch(`/api/task`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) throw new Error("Failed to delete task");
  } catch (err) {
    setTasks(prevTasks);
  }
};

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setDialogOpen(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">On-Track</h1>
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
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
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