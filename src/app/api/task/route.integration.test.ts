import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

import {
  GET,
  POST,
  PUT,
  DELETE,
} from "./route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

const getServerSessionMock = vi.mocked(getServerSession);

let testUserId: number;
let testCategoryId: number;

function createRequest(
  method: string,
  body?: unknown,
) {
  return new NextRequest("http://localhost/api/task", {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe("/api/task Integration Test", () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `integration-${Date.now()}@test.com`,
        name: "Integration Test User",
        password: "test-password",
      },
    });

    testUserId = user.id;

    const category = await prisma.category.create({
      data: {
        name: "Integration Test Category",
        color: "#ff0000",
        userId: testUserId,
      },
    });

    testCategoryId = category.id;

    getServerSessionMock.mockResolvedValue({
      user: {
        id: String(testUserId),
      },
    } as never);
  });

  beforeEach(async () => {
    await prisma.task.deleteMany({
      where: {
        userId: testUserId,
      },
    });
  });

  afterAll(async () => {
    await prisma.task.deleteMany({
      where: {
        userId: testUserId,
      },
    });

    await prisma.category.deleteMany({
      where: {
        userId: testUserId,
      },
    });

    await prisma.user.delete({
      where: {
        id: testUserId,
      },
    });

    await prisma.$disconnect();
  });

  // =========================================================
  // POST
  // =========================================================

  it("POST creates a task in the real database", async () => {
    const response = await POST(
      createRequest("POST", {
        title: "Integration Test Task",
        description: "Created using real Prisma",
        categoryId: testCategoryId,
        status: "TODO",
        startAt: "2026-07-27T00:00:00.000Z",
        endAt: "2026-07-30T00:00:00.000Z",
        isAllDay: false,
      }),
    );

    expect(response.status).toBe(201);

    const data = await response.json();

    expect(data.title).toBe("Integration Test Task");
    expect(data.userId).toBe(testUserId);

    const taskFromDatabase = await prisma.task.findUnique({
      where: {
        id: data.id,
      },
    });

    expect(taskFromDatabase).not.toBeNull();
    expect(taskFromDatabase?.title).toBe("Integration Test Task");
    expect(taskFromDatabase?.userId).toBe(testUserId);
    expect(taskFromDatabase?.categoryId).toBe(testCategoryId);
  });

  // =========================================================
  // GET
  // =========================================================

  it("GET returns tasks from the real database", async () => {
    const created = await prisma.task.create({
      data: {
        title: "GET Integration Task",
        description: "Testing GET",
        userId: testUserId,
        categoryId: testCategoryId,
      },
    });

    const response = await GET();

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.tasks).toHaveLength(1);
    expect(data.tasks[0].id).toBe(created.id);
    expect(data.tasks[0].title).toBe("GET Integration Task");
    expect(data.tasks[0].category).not.toBeNull();
    expect(data.tasks[0].category.name).toBe(
      "Integration Test Category",
    );
  });

  // =========================================================
  // PUT
  // =========================================================

  it("PUT updates a task in the real database", async () => {
    const created = await prisma.task.create({
      data: {
        title: "Original Task",
        description: "Original description",
        status: "TODO",
        userId: testUserId,
        categoryId: testCategoryId,
      },
    });

    const response = await PUT(
      createRequest("PUT", {
        id: created.id,
        title: "Updated Integration Task",
        description: "Updated description",
        status: "DONE",
      }),
    );

    expect(response.status).toBe(200);

    const updated = await prisma.task.findUnique({
      where: {
        id: created.id,
      },
    });

    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Updated Integration Task");
    expect(updated?.description).toBe("Updated description");
    expect(updated?.status).toBe("DONE");
  });

  // =========================================================
  // DELETE
  // =========================================================

  it("DELETE removes a task from the real database", async () => {
    const created = await prisma.task.create({
      data: {
        title: "Delete Integration Task",
        userId: testUserId,
      },
    });

    const response = await DELETE(
      createRequest("DELETE", {
        id: created.id,
      }),
    );

    expect(response.status).toBe(200);

    const deleted = await prisma.task.findUnique({
      where: {
        id: created.id,
      },
    });

    expect(deleted).toBeNull();
  });
});