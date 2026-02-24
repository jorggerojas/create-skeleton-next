import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { ensureComponentsJson } from "@/features/ui/shadcn/ensureComponentsJson";
import { shadcnAddComponents } from "@/features/ui/shadcn/addComponents";
import type { Context } from "@/core/context";

vi.mock("@/core/exec", () => ({
  run: vi.fn().mockResolvedValue(undefined),
  runWithOutput: vi.fn().mockResolvedValue("3.0.0"),
}));

describe("shadcn integration", () => {
  let tempDir: string;
  let ctx: Context;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-shadcn-"));
    ctx = {
      projectName: "test-project",
      targetDir: tempDir,
      router: "app",
      yes: false,
      install: true,
      github: {
        enabled: false,
        visibility: "private",
      },
      manager: "pnpm",
      shadcn: {
        enabled: true,
        components: [],
      },
    };
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("ensureComponentsJson", () => {
    it("should throw error when components.json is missing", () => {
      expect(() => ensureComponentsJson(ctx)).toThrow(
        'Missing "components.json"',
      );
    });

    it("should not throw when components.json exists", () => {
      const componentsJsonPath = path.join(tempDir, "components.json");
      fs.writeFileSync(componentsJsonPath, JSON.stringify({}), "utf-8");

      expect(() => ensureComponentsJson(ctx)).not.toThrow();
    });
  });

  describe("shadcnAddComponents", () => {
    it("should create src/lib directory and utils.ts when adding components", async () => {
      ctx.shadcn.components = ["button"];

      await shadcnAddComponents(ctx);

      const utilsPath = path.join(tempDir, "src", "lib", "utils.ts");
      expect(fs.existsSync(utilsPath)).toBe(true);
      const content = fs.readFileSync(utilsPath, "utf-8");
      expect(content).toContain("import { clsx");
      expect(content).toContain("export function cn");
    });

    it("should not run when components list is empty", async () => {
      ctx.shadcn.components = [];
      const utilsPath = path.join(tempDir, "src", "lib", "utils.ts");

      await shadcnAddComponents(ctx);

      expect(fs.existsSync(utilsPath)).toBe(false);
    });
  });
});
