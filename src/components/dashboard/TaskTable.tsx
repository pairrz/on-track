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

import {
  ChevronDown,
  Trash2,
} from "lucide-react";

import {
  statusLabels,
  type Task,
  type TaskStatus,
} from "./tasks-data";

const statusStyles: Record<TaskStatus, string> = {
  DONE:
    "bg-[#7F9C87] text-white border-[#7F9C87] shadow-sm",

  IN_PROGRESS:
    "bg-[#065799] text-white border-[#065799] shadow-sm",

  TODO:
    "bg-[#D3B7A6] text-[#4a3428] border-[#D3B7A6] shadow-sm",

  CANCELLED:
    "bg-[#F87828] text-white border-[#F87828] shadow-sm",
};

const STATUS_OPTIONS: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
];

function formatDate(iso: string | null) {
  if (!iso) return "-";

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
    <div className="overflow-hidden rounded-2xl border border-[#065799]/10 bg-white shadow-lg shadow-[#065799]/5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#065799]/10 bg-gradient-to-r from-[#065799]/5 via-white to-[#F87828]/5 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[#F87828] shadow-sm shadow-[#F87828]" />

            <h2 className="text-lg font-black text-[#065799]">
              Tasks
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage and track all your active tasks
          </p>
        </div>

        <div className="rounded-full bg-[#065799]/10 px-3 py-1 text-xs font-bold text-[#065799]">
          {tasks.length}{" "}
          {tasks.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#065799]/10 bg-[#065799]/5 hover:bg-[#065799]/5">
              <TableHead className="min-w-[240px] font-bold text-[#065799]">
                Task Name
              </TableHead>

              <TableHead className="font-bold text-[#065799]">
                Status
              </TableHead>

              <TableHead className="font-bold text-[#065799]">
                Due Date
              </TableHead>

              <TableHead className="w-12 text-right font-bold text-[#065799]">
                Delete
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className="border-b border-slate-100 transition-all hover:bg-[#F87828]/5"
              >
                {/* Task name */}
                <TableCell className="font-semibold">
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="text-left text-slate-800 transition-colors hover:text-[#F87828] hover:underline"
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
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold shadow-sm transition hover:scale-105",
                          statusStyles[task.status],
                        )}
                      >
                        {statusLabels[task.status]}

                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="start"
                      className="border-[#065799]/10 shadow-xl"
                    >
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
                <TableCell className="text-sm font-medium text-slate-500">
                  {formatDate(task.endAt)}
                </TableCell>

                {/* Delete */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 transition-all hover:scale-110 hover:bg-red-500/10 hover:text-red-600"
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
                  className="py-14 text-center text-sm text-slate-400"
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