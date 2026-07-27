import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

import {
  GET,
  POST,
  PUT,
  DELETE,
} from "./route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

const getServerSessionMock = vi.mocked(getServerSession);

const taskFindManyMock = vi.mocked(prisma.task.findMany);
const taskFindFirstMock = vi.mocked(prisma.task.findFirst);
const taskCreateMock = vi.mocked(prisma.task.create);
const taskUpdateMock = vi.mocked(prisma.task.update);
const taskDeleteMock = vi.mocked(prisma.task.delete);

const mockSession = {
  user: {
    id: "1",
  },
};

const mockTask = {
  id: 10,
  title: "Test task",
  description: "Test description",
  categoryId: 2,
  status: "TODO",
  startAt: new Date("2026-07-27T00:00:00.000Z"),
  endAt: new Date("2026-07-30T00:00:00.000Z"),
  isAllDay: false,
  userId: 1,
  category: {
    id: 2,
    name: "School",
    color: "#ff0000",
  },
};

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

describe("/api/task", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getServerSessionMock.mockResolvedValue(
      mockSession as never,
    );
  });

  // =========================================================
  // GET
  // =========================================================

  describe("GET", () => {
    it("returns tasks for the logged-in user", async () => {
      taskFindManyMock.mockResolvedValue([
        mockTask,
      ] as never);

      const response = await GET();

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data).toEqual({
        tasks: [
    {
      ...mockTask,
      startAt: mockTask.startAt.toISOString(),
      endAt: mockTask.endAt.toISOString(),
    },
  ],
});

      expect(taskFindManyMock).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });
    });

    it("returns 401 when user is not logged in", async () => {
      getServerSessionMock.mockResolvedValue(null);

      const response = await GET();

      expect(response.status).toBe(401);

      const data = await response.json();

      expect(data).toEqual({
        error: "Unauthorized",
      });

      expect(taskFindManyMock).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // POST
  // =========================================================

  describe("POST", () => {
    it("creates a new task successfully", async () => {
      taskCreateMock.mockResolvedValue(mockTask as never);

      const response = await POST(
        createRequest("POST", {
          title: "  New task  ",
          description: "Description",
          categoryId: 2,
          status: "IN_PROGRESS",
          startAt: "2026-08-01T00:00:00.000Z",
          endAt: "2026-08-05T00:00:00.000Z",
          isAllDay: false,
        }),
      );

      expect(response.status).toBe(201);

      const data = await response.json();

      expect(data).toEqual({
  ...mockTask,
  startAt: mockTask.startAt.toISOString(),
  endAt: mockTask.endAt.toISOString(),
});

      expect(taskCreateMock).toHaveBeenCalledWith({
        data: {
          title: "New task",
          description: "Description",
          categoryId: 2,
          status: "IN_PROGRESS",
          startAt: new Date("2026-08-01T00:00:00.000Z"),
          endAt: new Date("2026-08-05T00:00:00.000Z"),
          isAllDay: false,
          userId: 1,
        },
        include: {
          category: true,
        },
      });
    });

    it("uses default values when optional fields are missing", async () => {
      taskCreateMock.mockResolvedValue(mockTask as never);

      const response = await POST(
        createRequest("POST", {
          title: "Simple task",
        }),
      );

      expect(response.status).toBe(201);

      expect(taskCreateMock).toHaveBeenCalledWith({
        data: {
          title: "Simple task",
          description: null,
          categoryId: null,
          status: "TODO",
          startAt: null,
          endAt: null,
          isAllDay: false,
          userId: 1,
        },
        include: {
          category: true,
        },
      });
    });

    it("trims whitespace from the title", async () => {
      taskCreateMock.mockResolvedValue(mockTask as never);

      await POST(
        createRequest("POST", {
          title: "    Homework    ",
        }),
      );

      expect(taskCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Homework",
          }),
        }),
      );
    });

    it("returns 400 when title is missing", async () => {
      const response = await POST(
        createRequest("POST", {
          description: "No title",
        }),
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        error: "Please enter a task title",
      });

      expect(taskCreateMock).not.toHaveBeenCalled();
    });

    it("returns 400 when title is empty", async () => {
      const response = await POST(
        createRequest("POST", {
          title: "   ",
        }),
      );

      expect(response.status).toBe(400);

      expect(taskCreateMock).not.toHaveBeenCalled();
    });

    it("returns 401 when user is not logged in", async () => {
      getServerSessionMock.mockResolvedValue(null);

      const response = await POST(
        createRequest("POST", {
          title: "Test task",
        }),
      );

      expect(response.status).toBe(401);

      expect(taskCreateMock).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // PUT
  // =========================================================

  describe("PUT", () => {
    it("updates an existing task successfully", async () => {
      taskFindFirstMock.mockResolvedValue(mockTask as never);
      taskUpdateMock.mockResolvedValue({
        ...mockTask,
        title: "Updated task",
      } as never);

      const response = await PUT(
        createRequest("PUT", {
          id: 10,
          title: "Updated task",
          description: "Updated description",
          status: "DONE",
          startAt: "2026-08-01T00:00:00.000Z",
          endAt: "2026-08-05T00:00:00.000Z",
          isAllDay: true,
          categoryId: 3,
        }),
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data.title).toBe("Updated task");

      expect(taskFindFirstMock).toHaveBeenCalledWith({
        where: {
          id: 10,
          userId: 1,
        },
      });

      expect(taskUpdateMock).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
        data: {
          title: "Updated task",
          description: "Updated description",
          status: "DONE",
          startAt: new Date("2026-08-01T00:00:00.000Z"),
          endAt: new Date("2026-08-05T00:00:00.000Z"),
          isAllDay: true,
          categoryId: 3,
        },
        include: {
          category: true,
        },
      });
    });

    it("returns 400 when id is missing", async () => {
      const response = await PUT(
        createRequest("PUT", {
          title: "Updated task",
        }),
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        error: "Please specify an ID",
      });

      expect(taskFindFirstMock).not.toHaveBeenCalled();
      expect(taskUpdateMock).not.toHaveBeenCalled();
    });

    it("returns 404 when task does not belong to user", async () => {
      taskFindFirstMock.mockResolvedValue(null);

      const response = await PUT(
        createRequest("PUT", {
          id: 999,
          title: "Hack task",
        }),
      );

      expect(response.status).toBe(404);

      const data = await response.json();

      expect(data).toEqual({
        error: "Task not found or you don't have permission to edit it",
      });

      expect(taskUpdateMock).not.toHaveBeenCalled();
    });

    it("returns 400 when there are no fields to update", async () => {
      taskFindFirstMock.mockResolvedValue(mockTask as never);

      const response = await PUT(
        createRequest("PUT", {
          id: 10,
        }),
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        error: "No fields to update",
      });

      expect(taskUpdateMock).not.toHaveBeenCalled();
    });

    it("returns 401 when user is not logged in", async () => {
      getServerSessionMock.mockResolvedValue(null);

      const response = await PUT(
        createRequest("PUT", {
          id: 10,
          title: "Updated task",
        }),
      );

      expect(response.status).toBe(401);

      expect(taskFindFirstMock).not.toHaveBeenCalled();
      expect(taskUpdateMock).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // DELETE
  // =========================================================

  describe("DELETE", () => {
    it("deletes an existing task successfully", async () => {
      taskFindFirstMock.mockResolvedValue(mockTask as never);
      taskDeleteMock.mockResolvedValue(mockTask as never);

      const response = await DELETE(
        createRequest("DELETE", {
          id: 10,
        }),
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data).toEqual({
        message: "Task deleted successfully",
      });

      expect(taskFindFirstMock).toHaveBeenCalledWith({
        where: {
          id: 10,
          userId: 1,
        },
      });

      expect(taskDeleteMock).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
      });
    });

    it("returns 400 when id is missing", async () => {
      const response = await DELETE(
        createRequest("DELETE", {}),
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        error: "Please specify an ID",
      });

      expect(taskFindFirstMock).not.toHaveBeenCalled();
      expect(taskDeleteMock).not.toHaveBeenCalled();
    });

    it("returns 404 when task does not belong to user", async () => {
      taskFindFirstMock.mockResolvedValue(null);

      const response = await DELETE(
        createRequest("DELETE", {
          id: 999,
        }),
      );

      expect(response.status).toBe(404);

      const data = await response.json();

      expect(data).toEqual({
        error: "Task not found or you don't have permission to delete it",
      });

      expect(taskDeleteMock).not.toHaveBeenCalled();
    });

    it("returns 401 when user is not logged in", async () => {
      getServerSessionMock.mockResolvedValue(null);

      const response = await DELETE(
        createRequest("DELETE", {
          id: 10,
        }),
      );

      expect(response.status).toBe(401);

      expect(taskFindFirstMock).not.toHaveBeenCalled();
      expect(taskDeleteMock).not.toHaveBeenCalled();
    });
  });
});