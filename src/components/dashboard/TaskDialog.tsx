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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { Task, TaskPriority, TaskStatus } from "./tasks-data";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (task: Task) => void;
  onDelete?: (id: string) => void;
  task?: Task | null;
}

const STATUSES: TaskStatus[] = ["Not Started", "In Progress", "Completed", "Overdue"];
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];

export function TaskDialog({ open, onOpenChange, onSave, onDelete, task }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const isEdit = !!task;

  const [name, setName] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Not Started");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [startDate, setStartDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      if (task) {
        setName(task.name);
        setStatus(task.status);
        setPriority(task.priority);
        setStartDate(task.startDate);
        setDueDate(task.dueDate);
        setProgress(task.progress);
      } else {
        setName("");
        setStatus("Not Started");
        setPriority("Medium");
        setStartDate(today);
        setDueDate(today);
        setProgress(0);
      }
    }
  }, [open, task, today]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: task?.id ?? crypto.randomUUID(),
      name: name.trim(),
      status,
      priority,
      startDate,
      dueDate,
      progress: status === "Completed" ? 100 : progress,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "Create new task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this task."
              : "Add a task to your dashboard. You can update its status anytime."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task name</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Draft product spec"
              autoFocus
            />
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
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start date</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Progress</Label>
              <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(v) => setProgress(v[0] ?? 0)}
              max={100}
              step={5}
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <div>
              {isEdit && onDelete && task && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onDelete(task.id);
                    onOpenChange(false);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                {isEdit ? "Save changes" : "Create task"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
