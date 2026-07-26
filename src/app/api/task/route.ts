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

  const tasks = await prisma.task.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const { title, description, categoryId, status, startAt, endAt, isAllDay } = await request.json();

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Please enter a task title" }, { status: 400 });
  }

  const newTask = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description || null,
      categoryId: categoryId ?? null,
      status: status ?? "TODO",
      startAt: startAt ? new Date(startAt) : null,
      endAt: endAt ? new Date(endAt) : null,
      isAllDay: isAllDay ?? false,
      userId,
    },
    include: { category: true },
  });

  return NextResponse.json(newTask, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Please specify an ID" }, { status: 400 });
  }

  const existing = await prisma.task.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json(
      { error: "Task not found or you don't have permission to edit it" },
      { status: 404 },
    );
  }

  const allowedFields = [
    "title",
    "description",
    "categoryId",
    "status",
    "startAt",
    "endAt",
    "isAllDay",
  ] as const;

  const data: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (!(field in updates)) continue;

    if (field === "startAt" || field === "endAt") {
      data[field] = updates[field] ? new Date(updates[field]) : null;
    } else {
      data[field] = updates[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data,
    include: { category: true },
  });

  return NextResponse.json(updatedTask);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Please specify an ID" }, { status: 400 });
  }

  const existing = await prisma.task.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Task not found or you don't have permission to delete it" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ message: "Task deleted successfully" });
}