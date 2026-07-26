"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Task,
  type TaskStatus,
} from "@/components/dashboard/tasks-data";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/task");
      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data: Task[] = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateStatus = useCallback(async (id: number, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    );

    try {
      const res = await fetch(`/api/task`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      await fetchTasks();
      throw err;
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: number) => {
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
      throw err;
    }
  }, [tasks]);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    updateStatus,
    deleteTask,
  };
}