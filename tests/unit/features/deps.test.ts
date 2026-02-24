import { describe, it, expect, vi } from "vitest";
import { packageManagerInstall } from "@/features/deps/packageManagerInstall";
import type { Context } from "@/core/context";

vi.mock("@/core/exec", () => ({
  run: vi.fn(),
}));

describe("packageManagerInstall", () => {
  it("should run package manager install in target directory", async () => {
    const { run } = await import("@/core/exec");
    vi.mocked(run).mockResolvedValue();

    const ctx: Context = {
      projectName: "test-project",
      targetDir: "/tmp/test-project",
      router: "app",
      yes: false,
      manager: "pnpm",
      install: true,
      github: {
        enabled: false,
        visibility: "private",
      },
      shadcn: {
        enabled: true,
        components: [],
      },
    };

    await packageManagerInstall(ctx);

    expect(run).toHaveBeenCalledWith(
      ctx.manager,
      ["install"],
      "/tmp/test-project",
    );
  });
});
