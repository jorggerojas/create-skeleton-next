import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { shadcnAddComponents } from "@/features/ui/shadcn/addComponents";
import type { Context } from "@/core/context";

vi.mock("@/core/exec", () => ({
  run: vi.fn(),
  runWithOutput: vi.fn(),
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
    const { run } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();

    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    const libDir = path.join(tempDir, "src", "lib");
    expect(fs.existsSync(libDir)).toBe(true);
  });

  it("should create utils.ts with correct content", async () => {
    const { run } = await import("@/core/exec");
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
    const { run } = await import("@/core/exec");
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
    const { run } = await import("@/core/exec");
    vi.mocked(run).mockClear();
    vi.mocked(run).mockResolvedValue();

    ctx.shadcn.components = [];

    await shadcnAddComponents(ctx);

    expect(run).not.toHaveBeenCalled();

    const utilsPath = path.join(tempDir, "src", "lib", "utils.ts");
    expect(fs.existsSync(utilsPath)).toBe(false);
  });

  it("should use yarn dlx when manager is yarn and Yarn 2+", async () => {
    const { run, runWithOutput } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();
    vi.mocked(runWithOutput).mockResolvedValue("2.0.0");

    ctx.manager = "yarn";
    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalledWith(
      "yarn",
      ["dlx", "shadcn@latest", "add", "-y", "button"],
      tempDir,
    );
  });

  it("should fallback to npx when manager is yarn and Yarn 1.x", async () => {
    const { run, runWithOutput } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();
    vi.mocked(runWithOutput).mockResolvedValue("1.22.22");

    ctx.manager = "yarn";
    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalledWith(
      "npx",
      ["shadcn@latest", "add", "-y", "button"],
      tempDir,
    );
  });

  it("should fallback to npx when manager is yarn and yarn --version fails", async () => {
    const { run, runWithOutput } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();
    vi.mocked(runWithOutput).mockRejectedValue(new Error("yarn not found"));

    ctx.manager = "yarn";
    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalledWith(
      "npx",
      ["shadcn@latest", "add", "-y", "button"],
      tempDir,
    );
  });

  it("should fallback to npx when manager is yarn and version is empty or malformed", async () => {
    const { run, runWithOutput } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();
    vi.mocked(runWithOutput).mockResolvedValue("");

    ctx.manager = "yarn";
    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalledWith(
      "npx",
      ["shadcn@latest", "add", "-y", "button"],
      tempDir,
    );
  });

  it("should continue when utils.ts creation fails", async () => {
    const { run } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();

    const writeFileSyncSpy = vi
      .spyOn(fs, "writeFileSync")
      .mockImplementation(() => {
        throw new Error("Permission denied");
      });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalled();
    writeFileSyncSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it("should skip creating utils.ts when it already exists but still run install and shadcn add", async () => {
    const { run } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();

    const libDir = path.join(tempDir, "src", "lib");
    fs.mkdirSync(libDir, { recursive: true });
    fs.writeFileSync(path.join(libDir, "utils.ts"), "existing", "utf-8");

    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalledWith(
      "pnpm",
      ["add", "tailwind-merge"],
      tempDir,
    );
    expect(run).toHaveBeenCalledWith(
      "pnpm",
      ["dlx", "shadcn@latest", "add", "-y", "button"],
      tempDir,
    );
    const content = fs.readFileSync(path.join(libDir, "utils.ts"), "utf-8");
    expect(content).toBe("existing");
  });

  it("should continue when tailwind-merge install fails", async () => {
    const { run } = await import("@/core/exec");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(run).mockImplementation(async (_cmd, args) => {
      if (Array.isArray(args) && args.includes("tailwind-merge")) {
        throw new Error("install failed");
      }
    });

    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalledWith(
      "pnpm",
      ["dlx", "shadcn@latest", "add", "-y", "button"],
      tempDir,
    );
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should use npm install when manager is npm", async () => {
    const { run } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();

    ctx.manager = "npm";
    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalledWith(
      "npm",
      ["install", "tailwind-merge"],
      tempDir,
    );
    expect(run).toHaveBeenCalledWith(
      "npx",
      ["shadcn@latest", "add", "-y", "button"],
      tempDir,
    );
  });

  it("should use bunx when manager is bun", async () => {
    const { run } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();

    ctx.manager = "bun";
    ctx.shadcn.components = ["button"];

    await shadcnAddComponents(ctx);

    expect(run).toHaveBeenCalledWith("bun", ["add", "tailwind-merge"], tempDir);
    expect(run).toHaveBeenCalledWith(
      "bunx",
      ["--bun", "shadcn@latest", "add", "-y", "button"],
      tempDir,
    );
  });
});
