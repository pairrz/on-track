import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "work", color: "#3b82f6" }, 
  { name: "study", color: "#10b981" },  
  { name: "meeting", color: "#f59e0b" },     
];

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  let categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
    });

    categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const { name, color } = await request.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Please enter a category name" }, { status: 400 });
  }

  if (!color || typeof color !== "string") {
    return NextResponse.json({ error: "Please select a color" }, { status: 400 });
  }

  const newCategory = await prisma.category.create({
    data: {
      name: name.trim(),
      color,
      userId,
    },
  });

  return NextResponse.json(newCategory, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const { id, name, color } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Please specify an ID" }, { status: 400 });
  }

  const existing = await prisma.category.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Category not found or you don't have permission to edit it" }, { status: 404 });
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      color: color ?? existing.color,
    },
  });

  return NextResponse.json(updatedCategory);
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

  const existing = await prisma.category.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Category not found or you don't have permission to delete it" }, { status: 404 });
  }

  await prisma.task.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ message: "Category deleted successfully" });
}