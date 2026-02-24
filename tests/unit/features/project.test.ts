import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createProjectFromTemplate } from "@/features/project/createFromTemplate";
import type { Context } from "@/core/context";

vi.mock("@/core/exec", () => ({
  run: vi.fn(),
  cmdExists: vi.fn(),
}));

describe("createProjectFromTemplate", () => {
  let tempDir: string;
  let ctx: Context;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-project-"));
    ctx = {
      projectName: "test-project",
      targetDir: path.join(tempDir, "test-project"),
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

  it("should throw error when target directory is not empty", async () => {
    fs.mkdirSync(ctx.targetDir, { recursive: true });
    fs.writeFileSync(path.join(ctx.targetDir, "test.txt"), "test");

    await expect(createProjectFromTemplate(ctx)).rejects.toThrow(
      "already exists and is not empty",
    );
  });

  it("should use gh CLI when available and github enabled", async () => {
    const { run, cmdExists } = await import("@/core/exec");
    vi.mocked(cmdExists).mockResolvedValue(true);
    vi.mocked(run).mockClear();
    vi.mocked(run).mockResolvedValue();

    ctx.github.enabled = true;

    await createProjectFromTemplate(ctx);

    const calls = vi.mocked(run).mock.calls;
    expect(calls[0]).toBeDefined();
    expect(calls[0]?.[0]).toBe("gh");
    expect(calls[0]?.[1]).toContain("repo");
    expect(calls[0]?.[1]).toContain("create");
  });

  it("should fallback to git clone when gh not available", async () => {
    const { run, cmdExists } = await import("@/core/exec");
    vi.mocked(cmdExists).mockResolvedValue(false);
    vi.mocked(run).mockClear();
    vi.mocked(run).mockResolvedValue();

    ctx.github.enabled = true;

    // Mock fs.rmSync to avoid error
    vi.spyOn(fs, "rmSync").mockImplementation(() => {});

    await createProjectFromTemplate(ctx);

    const calls = vi.mocked(run).mock.calls;
    expect(calls[0]).toBeDefined();
    expect(calls[0]?.[0]).toBe("git");
    expect(calls[0]?.[1]).toContain("clone");
    expect(calls[0]?.[1]).toContain("--depth=1");
  });

  it("should use git clone when github disabled", async () => {
    const { run, cmdExists } = await import("@/core/exec");
    vi.mocked(cmdExists).mockResolvedValue(true);
    vi.mocked(run).mockClear();
    vi.mocked(run).mockResolvedValue();

    ctx.github.enabled = false;

    vi.spyOn(fs, "rmSync").mockImplementation(() => {});

    await createProjectFromTemplate(ctx);

    const calls = vi.mocked(run).mock.calls;
    expect(calls[0]).toBeDefined();
    expect(calls[0]?.[0]).toBe("git");
    expect(calls[0]?.[1]).toContain("clone");
  });

  it("should create public repo when visibility is public", async () => {
    const { run, cmdExists } = await import("@/core/exec");
    vi.mocked(cmdExists).mockResolvedValue(true);
    vi.mocked(run).mockClear();
    vi.mocked(run).mockResolvedValue();

    ctx.github.enabled = true;
    ctx.github.visibility = "public";

    await createProjectFromTemplate(ctx);

    const calls = vi.mocked(run).mock.calls;
    expect(calls[0]).toBeDefined();
    expect(calls[0]?.[0]).toBe("gh");
    expect(calls[0]?.[1]).toContain("--public");
  });
});
