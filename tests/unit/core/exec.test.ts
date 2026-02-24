import { describe, it, expect, vi, beforeEach } from "vitest";
import { cmdExists } from "@/core/exec";
import { execa } from "execa";

vi.mock("execa");

describe("exec utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cmdExists", () => {
    it("should return true when command exists", async () => {
      vi.mocked(execa).mockResolvedValueOnce({
        stdout: "",
        stderr: "",
        exitCode: 0,
        command: "which git",
        escapedCommand: "which git",
        failed: false,
        timedOut: false,
        isCanceled: false,
        all: undefined,
        stdio: [undefined, "pipe", "pipe"],
        ipcOutput: [],
        pipedFrom: [],
        cwd: "",
        durationMs: 0,
        isGracefullyCanceled: false,
        isMaxBuffer: false,
        isTerminated: false,
        isForcefullyTerminated: false,
        message: undefined,
        shortMessage: undefined,
        originalMessage: undefined,
        cause: undefined,
        code: undefined,
        name: undefined,
        stack: undefined,
      });

      const result = await cmdExists("git");
      expect(result).toBe(true);
      expect(execa).toHaveBeenCalledWith("which", ["git"], { stdio: "pipe" });
    });

    it("should return false when command does not exist", async () => {
      vi.mocked(execa).mockRejectedValueOnce(new Error("Command not found"));

      const result = await cmdExists("nonexistent");
      expect(result).toBe(false);
    });
  });
});
