"use client";

import { useEffect, useState } from "react";
import type { Task, TaskStatus } from "@/components/dashboard/tasks-data";

export interface Category {
  id: number;
  name: string;
  color: string;
}

export const NO_CATEGORY_VALUE = "none";
export const CREATE_CATEGORY_VALUE = "__create__";
const DEFAULT_NEW_COLOR = "#8b5cf6";

interface UseTaskDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (task: Task) => void;
  onDelete?: (id: number) => void;
  task?: Task | null;
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function useTaskDialog({
  open,
  onOpenChange,
  onSave,
  onDelete,
  task,
}: UseTaskDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [startAt, setStartAt] = useState(today);
  const [endAt, setEndAt] = useState(today);
  const [isAllDay, setIsAllDay] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(DEFAULT_NEW_COLOR);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/category");
        if (!res.ok) throw new Error("Failed to load category");
        const data = await res.json();
        setCategories(data.categories);
      } catch {
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setCreatingCategory(false);
    setCategoryError(null);

    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setStartAt(toDateInputValue(task.startAt) || today);
      setEndAt(toDateInputValue(task.endAt) || today);
      setIsAllDay(task.isAllDay);
      setCategoryId(task.categoryId);
    } else {
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setStartAt(today);
      setEndAt(today);
      setIsAllDay(false);
      setCategoryId(null);
    }
  }, [open, task, today]);

  useEffect(() => {
    if (isAllDay) {
      setEndAt(startAt);
    }
  }, [isAllDay, startAt]);

  const handleStartAtChange = (value: string) => {
    setStartAt(value);
    if (isAllDay) setEndAt(value);
  };

  const handleSelectCategory = (v: string) => {
    if (v === CREATE_CATEGORY_VALUE) {
      setCreatingCategory(true);
      setNewCategoryName("");
      setNewCategoryColor(DEFAULT_NEW_COLOR);
      setCategoryError(null);
      return;
    }
    setCategoryId(v === NO_CATEGORY_VALUE ? null : Number(v));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || savingCategory) return;

    setSavingCategory(true);
    setCategoryError(null);

    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), color: newCategoryColor }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create category");
      }

      const newCategory: Category = await res.json();
      setCategories((prev) => [...prev, newCategory]);
      setCategoryId(newCategory.id);
      setCreatingCategory(false);
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSavingCategory(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      startAt: startAt ? new Date(startAt).toISOString() : null,
      endAt: endAt ? new Date(endAt).toISOString() : null,
      isAllDay,
      categoryId,
    };

    try {
      const res = await fetch("/api/task", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: task!.id, ...payload } : payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save task");
      }

      const savedTask: Task = await res.json();
      onSave(savedTask);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!task || !onDelete) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/task", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete task");
      }

      onDelete(task.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isEdit,
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    startAt,
    handleStartAtChange,
    endAt,
    setEndAt,
    isAllDay,
    setIsAllDay,
    categoryId,
    categories,
    loadingCategories,
    handleSelectCategory,
    creatingCategory,
    setCreatingCategory,
    newCategoryName,
    setNewCategoryName,
    newCategoryColor,
    setNewCategoryColor,
    savingCategory,
    categoryError,
    handleCreateCategory,
    submitting,
    error,
    submit,
    handleDeleteClick,
  };
}