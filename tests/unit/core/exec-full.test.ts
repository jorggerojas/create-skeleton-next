import { describe, it, expect, vi } from "vitest";
import { run, runWithOutput } from "@/core/exec";
import { execa } from "execa";

vi.mock("execa");

describe("exec full coverage", () => {
  describe("run", () => {
    it("should execute command with cwd", async () => {
      vi.mocked(execa).mockResolvedValueOnce({
        stdout: "",
        stderr: "",
        exitCode: 0,
        command: "test",
        escapedCommand: "test",
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

      await run("test", ["arg1", "arg2"], "/tmp/test");

      expect(execa).toHaveBeenCalledWith("test", ["arg1", "arg2"], {
        cwd: "/tmp/test",
        stdio: "pipe",
      });
    });
  });

  describe("runWithOutput", () => {
    it("should return stdout", async () => {
      vi.mocked(execa).mockResolvedValueOnce({
        stdout: "test output",
        stderr: "",
        exitCode: 0,
        command: "test",
        escapedCommand: "test",
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

      const result = await runWithOutput("test", ["arg"], "/tmp");

      expect(result).toBe("test output");
    });
  });
});
