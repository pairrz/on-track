import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const [tasks, taskCount] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    tasks,
    summary: {
      total: tasks.length,
      byStatus: taskCount,
    },
  });
}