import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { shadcnAddComponents } from "../../../src/features/ui/shadcn/addComponents";
import type { Context } from "../../../src/core/context";

vi.mock("../../../src/core/exec", () => ({
  run: vi.fn(),
}));

describe("shadcnAddComponents", () => {
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
      shadcn: {
        enabled: true,
        components: [],
      },
      manager: "pnpm",
    };
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should create src/lib directory", async () => {
    const { run } = await import("../../../src/core/exec");
    vi.mocked(run).mockResolvedValue();

    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    const libDir = path.join(tempDir, "src", "lib");
    expect(fs.existsSync(libDir)).toBe(true);
  });

  it("should create utils.ts with correct content", async () => {
    const { run } = await import("../../../src/core/exec");
    vi.mocked(run).mockResolvedValue();

    ctx.shadcn.components = ["button", "input"];

    await shadcnAddComponents(ctx);

    const utilsPath = path.join(tempDir, "src", "lib", "utils.ts");
    expect(fs.existsSync(utilsPath)).toBe(true);

    const content = fs.readFileSync(utilsPath, "utf-8");
    expect(content).toContain("import { clsx, type ClassValue }");
    expect(content).toContain("import { twMerge }");
    expect(content).toContain("export function cn");
    expect(content).toContain("return twMerge(clsx(inputs))");
  });

  it("should call shadcn add with correct components", async () => {
    const { run } = await import("../../../src/core/exec");
    vi.mocked(run).mockResolvedValue();

    ctx.shadcn.components = ["button", "input", "dialog"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalledWith(
      "pnpm",
      ["dlx", "shadcn@latest", "add", "-y", "button", "input", "dialog"],
      tempDir,
    );
  });

  it("should skip when no components", async () => {
    const { run } = await import("../../../src/core/exec");
    vi.mocked(run).mockClear();
    vi.mocked(run).mockResolvedValue();

    ctx.shadcn.components = [];

    await shadcnAddComponents(ctx);

    expect(run).not.toHaveBeenCalled();

    const utilsPath = path.join(tempDir, "src", "lib", "utils.ts");
    expect(fs.existsSync(utilsPath)).toBe(false);
  });
});
