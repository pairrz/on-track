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

import {
  Plus,
  CalendarDays,
  FileText,
  Tag,
  Clock3,
  Trash2,
} from "lucide-react";

import {
  statusLabels,
  type Task,
  type TaskStatus,
} from "./tasks-data";

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

const STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
];

export function TaskDialog({
  open,
  onOpenChange,
  onSave,
  onDelete,
  task,
}: Props) {
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
  } = useTaskDialog({
    open,
    onOpenChange,
    onSave,
    onDelete,
    task,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex
          max-h-[90vh]
          flex-col
          overflow-hidden
          rounded-2xl
          border-slate-200
          bg-white
          p-0
          shadow-2xl
          sm:max-w-[540px]
        "
      >
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              {isEdit ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </div>

            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-slate-900">
                {isEdit ? "Edit task" : "Create new task"}
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-slate-500">
                {isEdit
                  ? "Update the details of this task."
                  : "Add a task to your dashboard."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form
          onSubmit={submit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Scrollable content */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-6">
              {/* Task details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />

                  <h3 className="text-sm font-semibold text-slate-800">
                    Task details
                  </h3>
                </div>

                {/* Task name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="task-title"
                    className="text-xs font-semibold text-slate-600"
                  >
                    Task name
                  </Label>

                  <Input
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Draft product spec"
                    autoFocus
                    className="
                      h-10
                      rounded-lg
                      border-slate-200
                      bg-slate-50/50
                      transition-all
                      placeholder:text-slate-400
                      focus:bg-white
                      focus:ring-2
                      focus:ring-slate-200
                    "
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="task-description"
                    className="text-xs font-semibold text-slate-600"
                  >
                    Description
                  </Label>

                  <Textarea
                    id="task-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional details..."
                    rows={3}
                    className="
                      resize-none
                      rounded-lg
                      border-slate-200
                      bg-slate-50/50
                      transition-all
                      placeholder:text-slate-400
                      focus:bg-white
                      focus:ring-2
                      focus:ring-slate-200
                    "
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-slate-600">
                      Category
                    </Label>

                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                  </div>

                  <Select
                    value={
                      categoryId
                        ? String(categoryId)
                        : NO_CATEGORY_VALUE
                    }
                    onValueChange={handleSelectCategory}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50/50 transition-all focus:bg-white">
                      <SelectValue
                        placeholder={
                          loadingCategories
                            ? "Loading..."
                            : "Select category"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                      <SelectItem value={NO_CATEGORY_VALUE}>
                        None
                      </SelectItem>

                      {categories.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={String(c.id)}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/5"
                              style={{
                                backgroundColor: c.color,
                              }}
                            />

                            {c.name}
                          </span>
                        </SelectItem>
                      ))}

                      <SelectItem value={CREATE_CATEGORY_VALUE}>
                        <span className="flex items-center gap-2 font-medium text-slate-700">
                          <Plus className="h-3.5 w-3.5" />
                          add new category
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Create category */}
                  {creatingCategory && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Category name (e.g., Personal)"
                          value={newCategoryName}
                          onChange={(e) =>
                            setNewCategoryName(e.target.value)
                          }
                          autoFocus
                          className="h-9 rounded-lg border-slate-200 bg-white"
                        />

                        <input
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) =>
                            setNewCategoryColor(e.target.value)
                          }
                          className="
                            h-9
                            w-9
                            shrink-0
                            cursor-pointer
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            p-0.5
                          "
                          title="เลือกสี"
                        />
                      </div>

                      {categoryError && (
                        <p className="text-xs font-medium text-red-500">
                          {categoryError}
                        </p>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCreatingCategory(false)
                          }
                          disabled={savingCategory}
                          className="rounded-lg text-slate-500 hover:bg-white hover:text-slate-900"
                        >
                          cancel
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateCategory}
                          disabled={
                            !newCategoryName.trim() ||
                            savingCategory
                          }
                          className="rounded-lg bg-slate-900 hover:bg-slate-800"
                        >
                          {savingCategory
                            ? "Saving..."
                            : "Save Category"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />

                  <h3 className="text-sm font-semibold text-slate-800">
                    Schedule
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600">
                      Status
                    </Label>

                    <Select
                      value={status}
                      onValueChange={(v) =>
                        setStatus(v as TaskStatus)
                      }
                    >
                      <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                        {STATUSES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                          >
                            {statusLabels[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* All day */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600">
                      Schedule type
                    </Label>

                    <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50/50 px-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="all-day"
                          checked={isAllDay}
                          onCheckedChange={(v) =>
                            setIsAllDay(Boolean(v))
                          }
                        />

                        <Label
                          htmlFor="all-day"
                          className="cursor-pointer text-sm font-medium text-slate-600"
                        >
                          All day
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Start date */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="start"
                      className="text-xs font-semibold text-slate-600"
                    >
                      Start date
                    </Label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <Input
                        id="start"
                        type="date"
                        value={startAt}
                        onChange={(e) =>
                          handleStartAtChange(
                            e.target.value,
                          )
                        }
                        className="h-10 rounded-lg border-slate-200 bg-slate-50/50 pl-9 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Due date */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="end"
                      className="text-xs font-semibold text-slate-600"
                    >
                      Due date
                    </Label>

                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <Input
                        id="end"
                        type="date"
                        value={endAt}
                        onChange={(e) =>
                          setEndAt(e.target.value)
                        }
                        disabled={isAllDay}
                        className="h-10 rounded-lg border-slate-200 bg-slate-50/50 pl-9 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fixed footer */}
          <DialogFooter
            className="
              shrink-0
              gap-3
              border-t
              border-slate-100
              bg-white
              px-6
              py-4
              sm:justify-between
            "
          >
            <div>
              {isEdit && onDelete && task && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={submitting}
                  className="
                    w-full
                    rounded-lg
                    bg-red-600
                    shadow-sm
                    hover:bg-red-700
                    sm:w-auto
                  "
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="
                  flex-1
                  rounded-lg
                  border-slate-200
                  bg-white
                  hover:bg-slate-50
                  sm:flex-none
                "
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!title.trim() || submitting}
                className="
                  flex-1
                  rounded-lg
                  bg-slate-900
                  px-5
                  shadow-sm
                  hover:bg-slate-800
                  sm:flex-none
                "
              >
                {submitting
                  ? "Saving..."
                  : isEdit
                    ? "Save changes"
                    : "Create task"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
