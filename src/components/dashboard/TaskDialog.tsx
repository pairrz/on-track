"use client";

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
import {
  useTaskDialog,
  NO_CATEGORY_VALUE,
  CREATE_CATEGORY_VALUE,
} from "@/hooks/use-task-dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (task: Task) => void;
  onDelete?: (id: number) => void;
  task?: Task | null;
}

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];

export function TaskDialog({ open, onOpenChange, onSave, onDelete, task }: Props) {
  const {
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
  } = useTaskDialog({ open, onOpenChange, onSave, onDelete, task });

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
                onChange={(e) => handleStartAtChange(e.target.value)}
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