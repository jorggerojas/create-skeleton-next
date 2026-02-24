import { describe, it, expect } from "vitest";
import { DEFAULTS } from "@/config/defaults";

describe("defaults configuration", () => {
  it("should import the defaults configuration", () => {
    expect(DEFAULTS).toBeDefined();
  });

  it("should have correct default values", () => {
    expect(DEFAULTS.projectName).toBe("next-skeleton-app");
    expect(DEFAULTS.router).toBe("app");
    expect(DEFAULTS.github.enabled).toBe(true);
    expect(DEFAULTS.github.visibility).toBe("private");
    expect(DEFAULTS.install).toBe(true);
  });

  it("should have shadcn enabled by default", () => {
    expect(DEFAULTS.shadcn.enabled).toBe(true);
  });

  it("should include default shadcn components", () => {
    expect(DEFAULTS.shadcn.components).toContain("button");
    expect(DEFAULTS.shadcn.components).toContain("input");
    expect(DEFAULTS.shadcn.components).toContain("dialog");
    expect(DEFAULTS.shadcn.components.length).toBeGreaterThan(0);
  });
});
