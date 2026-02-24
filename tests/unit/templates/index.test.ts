import { describe, it, expect } from "vitest";
import { TEMPLATES } from "@/templates";

describe("templates", () => {
  it("should have app router template", () => {
    expect(TEMPLATES.app).toBe("jorggerojas/next-skeleton-app");
  });

  it("should have pages router template", () => {
    expect(TEMPLATES.pages).toBe("jorggerojas/next-skeleton-page");
  });

  it("should have both templates defined", () => {
    expect(Object.keys(TEMPLATES)).toHaveLength(2);
    expect(TEMPLATES).toHaveProperty("app");
    expect(TEMPLATES).toHaveProperty("pages");
  });
});
