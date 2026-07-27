"use client";

import { Badge } from "@/components/ui/badge";
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
import { ChevronDown, Trash2 } from "lucide-react";

import {
  statusLabels,
  type Task,
  type TaskStatus,
} from "./tasks-data";

const statusStyles: Record<TaskStatus, string> = {
  DONE:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",

  IN_PROGRESS:
    "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",

  TODO:
    "bg-muted text-muted-foreground border-border",

  CANCELLED:
    "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

const STATUS_OPTIONS: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
];

function formatDate(iso: string | null) {
  if (!iso) return "-";

  /*
   * Read YYYY-MM-DD directly.
   * Prevent timezone from changing the displayed date.
   */
  const datePart = iso.slice(0, 10);

  const [year, month, day] = datePart
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return "-";
  }

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  tasks: Task[];

  onStatusChange: (
    id: number,
    status: TaskStatus,
  ) => void;

  onEdit: (task: Task) => void;

  onDelete: (id: number) => void;
}

export function TaskTable({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">
            Tasks
          </h2>

          <p className="text-sm text-muted-foreground">
            Manage and track all your active tasks
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>

          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">

              <TableHead className="min-w-[240px]">
                Task Name
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead>
                Due Date
              </TableHead>

              <TableHead className="w-12 text-right">
                Delete
              </TableHead>

            </TableRow>
          </TableHeader>

          <TableBody>

            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className="hover:bg-muted/30 transition-colors"
              >

                {/* Task name */}
                <TableCell className="font-medium">
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="text-left hover:text-primary hover:underline transition-colors"
                  >
                    {task.title}
                  </button>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <DropdownMenu>

                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition hover:opacity-80",
                          statusStyles[task.status],
                        )}
                      >
                        {statusLabels[task.status]}

                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start">

                      {STATUS_OPTIONS.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() =>
                            onStatusChange(
                              task.id,
                              status,
                            )
                          }
                        >
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium",
                              statusStyles[status],
                            )}
                          >
                            {statusLabels[status]}
                          </Badge>
                        </DropdownMenuItem>
                      ))}

                    </DropdownMenuContent>

                  </DropdownMenu>
                </TableCell>

                {/* Due date */}
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(task.endAt)}
                </TableCell>

                {/* Delete */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
                    onClick={() =>
                      onDelete(task.id)
                    }
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>

              </TableRow>
            ))}

            {/* Empty */}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-sm text-muted-foreground py-10"
                >
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