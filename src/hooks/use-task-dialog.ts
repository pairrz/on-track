"use client";

import { useCallback, useEffect, useState } from "react";
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

function toDateInputValue(
  iso: string | null | undefined,
): string {
  if (!iso) return "";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Convert date input value:
 * "2026-08-01"
 * ->
 * "2026-08-01T00:00:00.000Z"
 */
function toISOStringFromDateInput(
  value: string | null | undefined,
) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function useTaskDialog({
  open,
  onOpenChange,
  onSave,
  onDelete,
  task,
}: UseTaskDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const isEdit = Boolean(task);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] =
    useState<TaskStatus>("TODO");

  const [startAt, setStartAt] = useState(today);
  const [endAt, setEndAt] = useState(today);

  const [isAllDay, setIsAllDay] = useState(false);

  const [categoryId, setCategoryId] =
    useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>(
    [],
  );

  const [loadingCategories, setLoadingCategories] =
    useState(false);

  const [creatingCategory, setCreatingCategory] =
    useState(false);

  const [newCategoryName, setNewCategoryName] =
    useState("");

  const [newCategoryColor, setNewCategoryColor] =
    useState(DEFAULT_NEW_COLOR);

  const [savingCategory, setSavingCategory] =
    useState(false);

  const [categoryError, setCategoryError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Load categories when dialog opens.
   */
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);

      try {
        const response = await fetch("/api/category");

        if (!response.ok) {
          throw new Error(
            "Failed to load categories",
          );
        }

        const data = (await response.json()) as {
          categories?: Category[];
        };

        if (!cancelled) {
          setCategories(data.categories ?? []);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [open]);

  /*
   * Reset / load task data when dialog opens
   * or selected task changes.
   */
  useEffect(() => {
    if (!open) return;

    setError(null);
    setCategoryError(null);
    setCreatingCategory(false);

    setNewCategoryName("");
    setNewCategoryColor(DEFAULT_NEW_COLOR);

    setSubmitting(false);
    setSavingCategory(false);

    if (task) {
      setTitle(task.title ?? "");
      setDescription(task.description ?? "");
      setStatus(task.status);

      setStartAt(
        toDateInputValue(task.startAt) || today,
      );

      setEndAt(
        toDateInputValue(task.endAt) || today,
      );

      setIsAllDay(task.isAllDay);
      setCategoryId(task.categoryId ?? null);
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

  /*
   * Start date changes.
   */
  const handleStartAtChange = (value: string) => {
    setStartAt(value);

    if (isAllDay) {
      setEndAt(value);
    }
  };

  /*
   * All-day changes.
   */
  const handleSetIsAllDay = (value: boolean) => {
    setIsAllDay(value);

    if (value && startAt) {
      setEndAt(startAt);
    }
  };

  /*
   * Category selection.
   */
  const handleSelectCategory = (value: string) => {
    if (value === CREATE_CATEGORY_VALUE) {
      setCreatingCategory(true);
      setNewCategoryName("");
      setNewCategoryColor(DEFAULT_NEW_COLOR);
      setCategoryError(null);
      return;
    }

    if (
      value === NO_CATEGORY_VALUE ||
      value === ""
    ) {
      setCategoryId(null);
      setCreatingCategory(false);
      setCategoryError(null);
      return;
    }

    const parsedId = Number(value);

    if (!Number.isNaN(parsedId)) {
      setCategoryId(parsedId);
      setCreatingCategory(false);
      setCategoryError(null);
    }
  };

  /*
   * Create category.
   */
  const handleCreateCategory = useCallback(
    async () => {
      const name = newCategoryName.trim();

      // Empty name = do nothing
      if (!name) {
        return;
      }

      if (savingCategory) {
        return;
      }

      setSavingCategory(true);
      setCategoryError(null);

      try {
        const response = await fetch(
          "/api/category",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              color: newCategoryColor,
            }),
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data &&
            typeof data.error === "string"
              ? data.error
              : "Failed to create category",
          );
        }

        const newCategory = data as Category;

        setCategories((current) => [
          ...current,
          newCategory,
        ]);

        setCategoryId(newCategory.id);

        setCreatingCategory(false);
        setNewCategoryName("");
        setNewCategoryColor(
          DEFAULT_NEW_COLOR,
        );

        setCategoryError(null);
      } catch (err) {
        setCategoryError(
          err instanceof Error
            ? err.message
            : "Failed to create category",
        );
      } finally {
        setSavingCategory(false);
      }
    },
    [
      newCategoryName,
      newCategoryColor,
      savingCategory,
    ],
  );

  /*
   * Submit task.
   */
  const submit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      ...(isEdit && task
        ? { id: task.id }
        : {}),

      title: trimmedTitle,

      description:
        description.trim() || null,

      status,

      // Convert YYYY-MM-DD -> ISO UTC
      startAt:
        toISOStringFromDateInput(startAt),

      endAt:
        toISOStringFromDateInput(endAt),

      isAllDay,

      categoryId,
    };

    try {
      const response = await fetch(
        "/api/task",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data &&
          typeof data.error === "string"
            ? data.error
            : "Failed to save task",
        );
      }

      onSave(data as Task);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save task",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Delete task.
   *
   * IMPORTANT:
   * The previous implementation only called onDelete()
   * without sending a DELETE request to the API.
   *
   * This implementation:
   * 1. Sends DELETE /api/task
   * 2. Sends the task id
   * 3. Calls onDelete after successful deletion
   * 4. Closes the dialog
   * 5. Handles API errors
   */
  const handleDeleteClick = async () => {
    if (!task || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/task",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: task.id,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data &&
          typeof data.error === "string"
            ? data.error
            : "Failed to delete task",
        );
      }

      /*
       * Only notify the parent after
       * the API deletion succeeds.
       */
      onDelete?.(task.id);

      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete task",
      );
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
    setStartAt,
    handleStartAtChange,

    endAt,
    setEndAt,

    isAllDay,
    setIsAllDay: handleSetIsAllDay,

    categoryId,
    setCategoryId,

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