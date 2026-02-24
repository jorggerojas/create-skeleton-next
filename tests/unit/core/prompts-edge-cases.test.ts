import { describe, it, expect, vi, beforeEach } from "vitest";
import { promptForMissingOptions } from "@/core/prompts";
import prompts from "prompts";

vi.mock("prompts");
vi.mock("@/core/exec", () => ({
  cmdExists: vi.fn(),
}));

describe("prompts edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle gh CLI not available", async () => {
    const { cmdExists } = await import("@/core/exec");
    vi.mocked(cmdExists).mockResolvedValue(false);

    vi.mocked(prompts).mockResolvedValue({
      router: "app",
      github: true,
      visibility: "private",
      install: true,
    });

    const result = await promptForMissingOptions(
      "test-project",
      undefined,
      undefined,
      undefined,
      undefined,
      false,
    );

    expect(result.router).toBe("app");
    expect(result.github).toBe(true);
  });

  it("should not prompt for visibility when github disabled", async () => {
    vi.mocked(prompts).mockResolvedValue({
      router: "app",
      github: false,
      install: true,
    });

    const result = await promptForMissingOptions(
      "test-project",
      undefined,
      undefined,
      undefined,
      undefined,
      false,
    );

    expect(result.github).toBe(false);
  });

  it("should prompt for manager when not provided", async () => {
    const { cmdExists } = await import("@/core/exec");
    vi.mocked(cmdExists).mockResolvedValue(true);

    vi.mocked(prompts)
      .mockResolvedValueOnce({ manager: "yarn" })
      .mockResolvedValueOnce({
        router: "app",
        github: false,
        visibility: "private",
        install: true,
      });

    const result = await promptForMissingOptions(
      "test-project",
      undefined,
      undefined,
      undefined,
      undefined,
      false,
    );

    expect(result.manager).toBe("yarn");
  });

  it("should prompt for visibility when github enabled and visibility not provided", async () => {
    const { cmdExists } = await import("@/core/exec");
    vi.mocked(cmdExists).mockResolvedValue(true);

    vi.mocked(prompts).mockResolvedValue({
      router: "app",
      github: true,
      visibility: "public",
      install: true,
    });

    const result = await promptForMissingOptions(
      "test-project",
      undefined,
      undefined,
      undefined,
      undefined,
      false,
    );

    expect(result.visibility).toBe("public");
  });

  it("should prompt for install when not provided", async () => {
    const { cmdExists } = await import("@/core/exec");
    vi.mocked(cmdExists).mockResolvedValue(true);

    vi.mocked(prompts).mockResolvedValue({
      router: "app",
      github: false,
      visibility: "private",
      install: false,
    });

    const result = await promptForMissingOptions(
      "test-project",
      undefined,
      "npm",
      undefined,
      undefined,
      undefined,
      false,
    );

    expect(result.install).toBe(false);
  });
});
