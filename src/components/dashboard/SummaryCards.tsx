import { CheckCircle2, Clock, ListTodo, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export function SummaryCards({ total, completed, inProgress, overdue }: SummaryCardsProps) {
  const cards = [
    {
      label: "Total Tasks",
      value: total,
      icon: ListTodo,
      accent: "bg-primary/10 text-primary",
      trend: "All active tasks",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      trend: `${Math.round((completed / total) * 100)}% completion rate`,
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      trend: "Currently active",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertTriangle,
      accent: "bg-red-500/10 text-red-600 dark:text-red-400",
      trend: "Needs attention",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, accent, trend }) => (
        <div
          key={label}
          className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            </div>
            <div className={cn("rounded-lg p-2.5", accent)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{trend}</p>
        </div>
      ))}
    </div>
  );
}
