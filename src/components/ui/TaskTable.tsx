import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Trash2 } from "lucide-react";
import type { Task, TaskStatus } from "./tasks-data";

const statusStyles: Record<TaskStatus, string> = {
  "Completed": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  "In Progress": "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  "Not Started": "bg-muted text-muted-foreground border-border",
  "Overdue": "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

const STATUS_OPTIONS: TaskStatus[] = ["Not Started", "In Progress", "Completed", "Overdue"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskTable({ tasks, onStatusChange, onEdit, onDelete }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = tasks.length > 0 && tasks.every((t) => checked[t.id]);
  

  const toggleAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    if (value) tasks.forEach((t) => (next[t.id] = true));
    setChecked(next);
  };

  const selectedIds = tasks.filter((t) => checked[t.id]).map((t) => t.id);
  const selectedCount = selectedIds.length;

  const bulkComplete = () => {
    selectedIds.forEach((id) => {
      const task = tasks.find((t) => t.id === id);
      if (task && task.status !== "Completed") onStatusChange(id, "Completed");
    });
    setChecked({});
  };

  const bulkDelete = () => {
    selectedIds.forEach((id) => onDelete(id));
    setChecked({});
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} selected`
              : "Manage and track all your active tasks"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
            onClick={bulkComplete}
            disabled={selectedCount === 0}
          >
            <Check className="h-4 w-4" />
            Complete
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-500/10"
            onClick={bulkDelete}
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-12">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all tasks"
                />
              </TableHead>
              <TableHead className="min-w-[240px]">Task Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                data-state={checked[task.id] ? "selected" : undefined}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={!!checked[task.id]}
                    onCheckedChange={(v) =>
                      setChecked((prev) => ({ ...prev, [task.id]: Boolean(v) }))
                    }
                    aria-label={`Select ${task.name}`}
                  />
                </TableCell>
                <TableCell
                  className={cn(
                    "font-medium",
                    checked[task.id] && "line-through text-muted-foreground",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="text-left hover:text-primary hover:underline transition-colors"
                  >
                    {task.name}
                  </button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition hover:opacity-80",
                          statusStyles[task.status],
                        )}
                      >
                        {task.status}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {STATUS_OPTIONS.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => onStatusChange(task.id, s)}
                        >
                          <Badge
                            variant="outline"
                            className={cn("font-medium", statusStyles[s])}
                          >
                            {s}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(task.dueDate)}
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                  No tasks match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
