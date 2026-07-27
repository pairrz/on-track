import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CREATE_CATEGORY_VALUE,
  NO_CATEGORY_VALUE,
  useTaskDialog,
} from "./use-task-dialog";
import type { Task } from "@/components/dashboard/tasks-data";

const mockTask: Task = {
  id: 10,
  title: "Existing task",
  description: "Test description",
  status: "IN_PROGRESS",
  startAt: "2026-07-20T00:00:00.000Z",
  endAt: "2026-07-25T00:00:00.000Z",
  isAllDay: true,
  categoryId: 2,
  category: {
    id: 2,
    name: "School",
    color: "#ff0000",
  },
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

function createResponse(data: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  };
}

describe("useTaskDialog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes a new task with default values", () => {
    const today = new Date().toISOString().slice(0, 10);

    const { result } = renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    expect(result.current.isEdit).toBe(false);
    expect(result.current.title).toBe("");
    expect(result.current.description).toBe("");
    expect(result.current.status).toBe("TODO");
    expect(result.current.startAt).toBe(today);
    expect(result.current.endAt).toBe(today);
    expect(result.current.isAllDay).toBe(false);
    expect(result.current.categoryId).toBe(null);
    expect(result.current.creatingCategory).toBe(false);
    expect(result.current.submitting).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("loads categories when dialog opens", async () => {
    const categories = [
      { id: 1, name: "Work", color: "#000000" },
      { id: 2, name: "School", color: "#ff0000" },
    ];

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(createResponse({ categories }));

    const { result } = renderHook(() =>
      useTaskDialog({
        open: true,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    await waitFor(() => {
      expect(result.current.categories).toEqual(categories);
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/category");
    expect(result.current.loadingCategories).toBe(false);
  });

  it("does not load categories while dialog is closed", () => {
    const fetchMock = vi.spyOn(global, "fetch");

    renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads existing task values when editing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      createResponse({ categories: [] }),
    );

    const { result } = renderHook(() =>
      useTaskDialog({
        open: true,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
        task: mockTask,
      }),
    );

    await waitFor(() => {
      expect(result.current.title).toBe("Existing task");
    });

    expect(result.current.description).toBe("Test description");
    expect(result.current.status).toBe("IN_PROGRESS");
    expect(result.current.startAt).toBe("2026-07-20");
    expect(result.current.endAt).toBe("2026-07-25");
    expect(result.current.isAllDay).toBe(true);
    expect(result.current.categoryId).toBe(2);
    expect(result.current.isEdit).toBe(true);
  });

  it("updates endAt when all-day is enabled", () => {
    const { result } = renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    act(() => {
      result.current.setStartAt("2026-08-10");
    });

    act(() => {
      result.current.setIsAllDay(true);
    });

    expect(result.current.startAt).toBe("2026-08-10");
    expect(result.current.endAt).toBe("2026-08-10");
  });

  it("updates endAt when start date changes while all-day is enabled", () => {
    const { result } = renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    act(() => {
      result.current.setIsAllDay(true);
    });

    act(() => {
      result.current.handleStartAtChange("2026-08-15");
    });

    expect(result.current.startAt).toBe("2026-08-15");
    expect(result.current.endAt).toBe("2026-08-15");
  });

  it("sets categoryId to null when selecting no category", () => {
    const { result } = renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleSelectCategory(NO_CATEGORY_VALUE);
    });

    expect(result.current.categoryId).toBe(null);
  });

  it("opens create-category mode when create category is selected", () => {
    const { result } = renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    act(() => {
      result.current.setNewCategoryName("Old value");
      result.current.handleSelectCategory(CREATE_CATEGORY_VALUE);
    });

    expect(result.current.creatingCategory).toBe(true);
    expect(result.current.newCategoryName).toBe("");
    expect(result.current.newCategoryColor).toBe("#8b5cf6");
    expect(result.current.categoryError).toBe(null);
  });

  it("selects an existing category by id", () => {
    const { result } = renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleSelectCategory("5");
    });

    expect(result.current.categoryId).toBe(5);
  });

  it("creates a new category successfully", async () => {
    const newCategory = {
      id: 3,
      name: "Personal",
      color: "#00ff00",
    };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(createResponse({ categories: [] }))
      .mockResolvedValueOnce(createResponse(newCategory));

    const { result } = renderHook(() =>
      useTaskDialog({
        open: true,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingCategories).toBe(false);
    });

    act(() => {
      result.current.handleSelectCategory(CREATE_CATEGORY_VALUE);
    });

    act(() => {
      result.current.setNewCategoryName(" Personal ");
      result.current.setNewCategoryColor("#00ff00");
    });

    await act(async () => {
      await result.current.handleCreateCategory();
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/category",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Personal",
          color: "#00ff00",
        }),
      }),
    );

    expect(result.current.categories).toContainEqual(newCategory);
    expect(result.current.categoryId).toBe(3);
    expect(result.current.creatingCategory).toBe(false);
    expect(result.current.savingCategory).toBe(false);
  });

  it("does not create a category when name is empty", async () => {
    const fetchMock = vi.spyOn(global, "fetch");

    const { result } = renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleCreateCategory();
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.categoryError).toBe(null);
  });

  it("submits a new task successfully", async () => {
    const savedTask = {
      ...mockTask,
      id: 20,
      title: "New task",
    };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(createResponse({ categories: [] }))
      .mockResolvedValueOnce(createResponse(savedTask));

    const onSave = vi.fn();
    const onOpenChange = vi.fn();

    const { result } = renderHook(() =>
      useTaskDialog({
        open: true,
        onOpenChange,
        onSave,
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingCategories).toBe(false);
    });

    act(() => {
      result.current.setTitle("  New task  ");
      result.current.setDescription("  Description  ");
      result.current.setStatus("IN_PROGRESS");
      result.current.setStartAt("2026-08-01");
      result.current.setEndAt("2026-08-05");
      result.current.setCategoryId(2);
    });

    await act(async () => {
      await result.current.submit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/task",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: "New task",
          description: "Description",
          status: "IN_PROGRESS",
          startAt: new Date("2026-08-01").toISOString(),
          endAt: new Date("2026-08-05").toISOString(),
          isAllDay: false,
          categoryId: 2,
        }),
      }),
    );

    expect(onSave).toHaveBeenCalledWith(savedTask);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(result.current.submitting).toBe(false);
  });

  it("does not submit when title is empty", async () => {
    const fetchMock = vi.spyOn(global, "fetch");

    const { result } = renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.submit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.error).toBe(null);
  });

  it("updates an existing task with PUT", async () => {
    const savedTask = {
      ...mockTask,
      title: "Updated task",
    };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(createResponse({ categories: [] }))
      .mockResolvedValueOnce(createResponse(savedTask));

    const onSave = vi.fn();
    const onOpenChange = vi.fn();

    const { result } = renderHook(() =>
      useTaskDialog({
        open: true,
        onOpenChange,
        onSave,
        task: mockTask,
      }),
    );

    await waitFor(() => {
      expect(result.current.title).toBe("Existing task");
    });

    act(() => {
      result.current.setTitle("Updated task");
    });

    await act(async () => {
      await result.current.submit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/task",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          id: 10,
          title: "Updated task",
          description: "Test description",
          status: "IN_PROGRESS",
          startAt: new Date("2026-07-20").toISOString(),
          endAt: new Date("2026-07-25").toISOString(),
          isAllDay: true,
          categoryId: 2,
        }),
      }),
    );

    expect(onSave).toHaveBeenCalledWith(savedTask);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("deletes an existing task successfully", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(createResponse({ categories: [] }))
      .mockResolvedValueOnce(createResponse({ success: true }));

    const onDelete = vi.fn();
    const onOpenChange = vi.fn();

    const { result } = renderHook(() =>
      useTaskDialog({
        open: true,
        onOpenChange,
        onSave: vi.fn(),
        onDelete,
        task: mockTask,
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingCategories).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteClick();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/task",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ id: 10 }),
      }),
    );

    expect(onDelete).toHaveBeenCalledWith(10);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(result.current.submitting).toBe(false);
  });

  it("does nothing when delete is requested without a task", async () => {
    const fetchMock = vi.spyOn(global, "fetch");

    const { result } = renderHook(() =>
      useTaskDialog({
        open: false,
        onOpenChange: vi.fn(),
        onSave: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleDeleteClick();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});