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

import { Plus, Search, LogOut } from "lucide-react";

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

      setTasks((current) =>
        current.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task,
        ),
      );
    } catch (err) {
      console.error(err);
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
      <div className="flex min-h-screen items-center justify-center bg-[#F3E7DE]">
        <div className="rounded-2xl bg-white/90 px-8 py-6 shadow-lg">
          <p className="text-sm font-medium text-[#4A7FA3]">
            Loading On-Track...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3E7DE] p-6">
        <div className="rounded-2xl border border-red-200 bg-white/90 px-8 py-6 shadow-lg">
          <p className="font-medium text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E7DE]">
      {/* Header */}
      <header className="border-b border-[#4A7FA3]/10 bg-white/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4A7FA3] shadow-sm">
                <span className="text-lg font-black text-white">
                  O
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#4A7FA3]">
                  On-Track
                </h1>

                <p className="mt-0.5 text-sm text-gray-500">
                  Track your tasks, status, and schedule in one place.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A7FA3]/60" />

              <Input
                placeholder="Search tasks..."
                className="w-64 border-[#4A7FA3]/20 bg-white pl-9 shadow-sm transition focus-visible:border-[#4A7FA3] focus-visible:ring-[#4A7FA3]/20"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
              />
            </div>

            {/* New task */}
            <Button
              onClick={openNew}
              className="bg-[#4A7FA3] font-semibold text-white shadow-sm transition-all hover:bg-[#3D6D8D] hover:shadow-md"
            >
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
              className="border-[#4A7FA3]/20 bg-white font-semibold text-[#4A7FA3] transition-all hover:bg-[#4A7FA3]/5"
            >
              <LogOut className="mr-1 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        
        {/* Page intro */}
        <div className="rounded-2xl border border-white/70 bg-white/65 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#F5A06A]">
                Dashboard
              </p>

              <h2 className="text-3xl font-black tracking-tight text-[#4A7FA3]">
                Your Work Overview
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Stay on top of your tasks and deadlines.
              </p>
            </div>

            <div className="rounded-xl bg-[#A8BDAE]/60 px-4 py-2 text-sm font-semibold text-[#385346]">
              {tasks.length}{" "}
              {tasks.length === 1 ? "Task" : "Tasks"}
            </div>

          </div>
        </div>

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