import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initLocalGitIfNeeded } from "@/features/git/initLocalGit";
import type { Context } from "@/core/context";

vi.mock("@/core/exec", () => ({
  run: vi.fn(),
  cmdExists: vi.fn(() => Promise.resolve(true)),
}));

describe("git integration", () => {
  let tempDir: string;
  let ctx: Context;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-git-"));
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

  describe("initLocalGitIfNeeded", () => {
    it("should skip git init if .git already exists", async () => {
      const gitDir = path.join(tempDir, ".git");
      fs.mkdirSync(gitDir);

      const { run } = await import("@/core/exec");
      await initLocalGitIfNeeded(ctx);

      expect(run).not.toHaveBeenCalled();
    });

    it("should init git when .git does not exist", async () => {
      const { run } = await import("@/core/exec");
      vi.mocked(run).mockClear();

      await initLocalGitIfNeeded(ctx);

      expect(run).toHaveBeenCalledWith("git", ["init"], tempDir);
      expect(run).toHaveBeenCalledWith("git", ["add", "."], tempDir);
      expect(run).toHaveBeenCalledWith(
        "git",
        ["commit", "-m", "chore: initial commit"],
        tempDir,
      );
    });

    it("should skip git init when git CLI is not available", async () => {
      const { run, cmdExists } = await import("@/core/exec");
      vi.mocked(cmdExists).mockResolvedValue(false);
      vi.mocked(run).mockClear();

      await initLocalGitIfNeeded(ctx);

      expect(run).not.toHaveBeenCalled();
    });
  });
});
