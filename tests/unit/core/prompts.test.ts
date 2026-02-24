import { describe, it, expect, vi, beforeEach } from "vitest";
import { promptForMissingOptions } from "../../../src/core/prompts";
import prompts from "prompts";

vi.mock("prompts");
vi.mock("../../../src/core/exec", () => ({
  cmdExists: vi.fn(() => Promise.resolve(true)),
}));

describe("prompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("promptForMissingOptions", () => {
    it("should return defaults when --yes flag is used", async () => {
      const result = await promptForMissingOptions(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true, // yes flag
      );

      expect(result.projectName).toBe("next-skeleton-app");
      expect(result.router).toBe("app");
      expect(result.github).toBe(true);
      expect(result.visibility).toBe("private");
      expect(result.install).toBe(true);
      expect(prompts).not.toHaveBeenCalled();
    });

    it("should use provided values when available", async () => {
      vi.mocked(prompts).mockResolvedValue({});

      const result = await promptForMissingOptions(
        "my-project",
        "pages",
        "pnpm",
        false,
        "public",
        false,
        false,
      );

      expect(result.projectName).toBe("my-project");
      expect(result.router).toBe("pages");
      expect(result.github).toBe(false);
      expect(result.visibility).toBe("public");
      expect(result.install).toBe(false);
    });

    it("should prompt for missing project name", async () => {
      vi.mocked(prompts).mockResolvedValue({
        projectName: "test-app",
        router: "app",
        github: true,
        visibility: "private",
        install: true,
      });

      const result = await promptForMissingOptions(
        undefined,
        "app",
        "yarn",
        true,
        "private",
        true,
        false,
      );

      expect(prompts).toHaveBeenCalled();
      expect(result.projectName).toBe("test-app");
    });

    it("should prompt for router when not provided", async () => {
      vi.mocked(prompts).mockResolvedValue({
        router: "pages",
        github: false,
        install: false,
      });

      const result = await promptForMissingOptions(
        "test-project",
        undefined,
        "bun",
        false,
        undefined,
        false,
        false,
      );

      expect(result.router).toBe("pages");
    });

    it("should handle user cancellation", async () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      // Simulate user pressing Ctrl+C
      vi.mocked(prompts).mockImplementation(
        async (
          _questions:
            | prompts.PromptObject<string>
            | prompts.PromptObject<string>[],
          options?: prompts.Options,
        ) => {
          options?.onCancel?.(
            {
              name: "test",
              type: "text",
            },
            new Error("User cancelled"),
          );
          return {};
        },
      );

      await expect(
        promptForMissingOptions(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          false,
        ),
      ).rejects.toThrow();

      mockExit.mockRestore();
    });
  });
});
