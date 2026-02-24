import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initLocalGitIfNeeded } from "../../../src/features/git/initLocalGit";
import type { Context } from "../../../src/core/context";

vi.mock("../../../src/core/exec", () => ({
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

      const { run } = await import("../../../src/core/exec");
      await initLocalGitIfNeeded(ctx);

      expect(run).not.toHaveBeenCalled();
    });

    it("should init git when .git does not exist", async () => {
      const { run } = await import("../../../src/core/exec");
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
  });
});
