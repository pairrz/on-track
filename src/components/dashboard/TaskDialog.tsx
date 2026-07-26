"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { statusLabels, type Task, type TaskStatus } from "./tasks-data";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (task: Task) => void;
  onDelete?: (id: number) => void;
  task?: Task | null;
}

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];
const NO_CATEGORY_VALUE = "none";
const CREATE_CATEGORY_VALUE = "__create__";
const DEFAULT_NEW_COLOR = "#8b5cf6";

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function TaskDialog({ open, onOpenChange, onSave, onDelete, task }: Props) {
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
    if (open) {
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
    }
  }, [open, task, today]);

  useEffect(() => {
    if (isAllDay) {
      setEndAt(startAt);
    }
  }, [isAllDay, startAt]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "Create new task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this task."
              : "Add a task to your dashboard."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task name</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Draft product spec"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={categoryId ? String(categoryId) : NO_CATEGORY_VALUE}
              onValueChange={handleSelectCategory}
              disabled={loadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY_VALUE}>None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value={CREATE_CATEGORY_VALUE}>
                  <span className="flex items-center gap-2 text-primary font-medium">
                    <Plus className="h-3.5 w-3.5" />
                    add new category
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {creatingCategory && (
              <div className="rounded-md border p-3 space-y-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Category name (e.g., Personal)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                  />
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="h-9 w-9 rounded border cursor-pointer shrink-0"
                    title="เลือกสี"
                  />
                </div>
                {categoryError && <p className="text-xs text-red-500">{categoryError}</p>}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCreatingCategory(false)}
                    disabled={savingCategory}
                  >
                    cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || savingCategory}
                  >
                    {savingCategory ? "Saving..." : "Save Category"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center gap-2 h-10">
                <Checkbox
                  id="all-day"
                  checked={isAllDay}
                  onCheckedChange={(v) => setIsAllDay(Boolean(v))}
                />
                <Label htmlFor="all-day" className="cursor-pointer">
                  All day
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start date</Label>
              <Input
                id="start"
                type="date"
                value={startAt}
                onChange={(e) => {
                  setStartAt(e.target.value);

                  if (isAllDay) {
                    setEndAt(e.target.value);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Due date</Label>
              <Input
                id="end"
                type="date"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                disabled={isAllDay}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter className="gap-2 sm:justify-between">
            <div>
              {isEdit && onDelete && task && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={submitting}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim() || submitting}>
                {submitting ? "Saving..." : isEdit ? "Save changes" : "Create task"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}