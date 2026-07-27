"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";

import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TaskTable } from "@/components/dashboard/TaskTable";
import { TaskCalendar } from "@/components/dashboard/TaskCalendar";
import { TaskDialog } from "@/components/dashboard/TaskDialog";

import {
  getTaskSummary,
  type Task,
  type TaskStatus,
} from "@/components/dashboard/tasks-data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Plus,
  Search,
  LogOut,
} from "lucide-react";

export function DashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  /*
   * Load tasks from API
   */
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/task");

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = (await response.json()) as {
          tasks?: Task[];
        };

        setTasks(data.tasks ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadTasks();
  }, []);

  /*
   * Search / filter tasks
   */
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return tasks;
    }

    return tasks.filter((task) =>
      task.title.toLowerCase().includes(normalizedQuery),
    );
  }, [tasks, query]);

  /*
   * Dashboard summary
   */
  const summary = getTaskSummary(tasks);

  /*
   * Change task status
   */
  const handleStatusChange = async (
    id: number,
    status: TaskStatus,
  ) => {
    const previousTasks = tasks;

    // Optimistic UI update
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
            }
          : task,
      ),
    );

    try {
      const response = await fetch("/api/task", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedTask = (await response.json()) as Task;

      // Use server response as source of truth
      setTasks((current) =>
        current.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task,
        ),
      );
    } catch (err) {
      console.error(err);

      // Rollback if API fails
      setTasks(previousTasks);
    }
  };

  /*
   * Save task
   */
  const handleSave = (savedTask: Task) => {
    setTasks((current) => {
      const exists = current.some(
        (task) => task.id === savedTask.id,
      );

      if (exists) {
        return current.map((task) =>
          task.id === savedTask.id
            ? savedTask
            : task,
        );
      }

      return [savedTask, ...current];
    });
  };

  /*
   * Delete task
   *
   * Delete from Database first,
   * then remove from local state.
   */
  const handleDelete = async (id: number) => {
    try {
      setError(null);

      const response = await fetch("/api/task", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data && typeof data.error === "string"
            ? data.error
            : "Failed to delete task",
        );
      }

      // Remove from UI only after Database deletion succeeds
      setTasks((current) =>
        current.filter((task) => task.id !== id),
      );
    } catch (err) {
      console.error("Delete task error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete task",
      );
    }
  };

  /*
   * Open dialog for creating a new task
   */
  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  /*
   * Open dialog for editing an existing task
   */
  const openEdit = (task: Task) => {
    setEditing(task);
    setDialogOpen(true);
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <div className="p-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              On-Track
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Track your tasks, status, and schedule in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search tasks..."
                className="w-64 pl-9"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
              />
            </div>

            {/* New task */}
            <Button onClick={openNew}>
              <Plus className="mr-1 h-4 w-4" />
              New Task
            </Button>

            {/* Logout */}
            <Button
              variant="outline"
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
            >
              <LogOut className="mr-1 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Summary */}
        <SummaryCards
          total={summary.total}
          completed={summary.completed}
          inProgress={summary.inProgress}
          overdue={summary.overdue}
        />

        {/* Task table */}
        <TaskTable
          tasks={filtered}
          onStatusChange={handleStatusChange}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        {/* Calendar */}
        <TaskCalendar
          tasks={tasks}
          onSelectTask={openEdit}
        />
      </main>

      {/* Task dialog */}
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