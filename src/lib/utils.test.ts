import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("combines class names", () => {
    expect(cn("text-red-500", "font-bold")).toBe(
      "text-red-500 font-bold"
    );
  });

  it("handles conditional class names", () => {
    expect(cn("base", false && "hidden", "active")).toBe(
      "base active"
    );
  });

  it("merges conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles null and undefined values", () => {
    expect(cn("base", null, undefined, "text-sm")).toBe(
      "base text-sm"
    );
  });
});