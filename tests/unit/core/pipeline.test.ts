import { describe, it, expect } from "vitest";
import { runPipeline, type Step } from "@/core/pipeline";
import type { Context } from "@/core/context";

describe("pipeline", () => {
  const mockContext: Context = {
    projectName: "test-project",
    targetDir: "/tmp/test-project",
    router: "app",
    yes: false,
    install: true,
    github: {
      enabled: false,
      visibility: "private",
    },
    shadcn: {
      enabled: true,
      components: ["button"],
    },
    manager: "pnpm",
  };

  describe("runPipeline", () => {
    it("should execute all steps in order", async () => {
      const executionOrder: string[] = [];
      const steps: Step[] = [
        {
          id: "step1",
          title: "Step 1",
          run: async () => {
            executionOrder.push("step1");
          },
        },
        {
          id: "step2",
          title: "Step 2",
          run: async () => {
            executionOrder.push("step2");
          },
        },
      ];

      await runPipeline(mockContext, steps);
      expect(executionOrder).toEqual(["step1", "step2"]);
    });

    it("should skip steps when when() returns false", async () => {
      const executedSteps: string[] = [];
      const steps: Step[] = [
        {
          id: "step1",
          title: "Step 1",
          run: async () => {
            executedSteps.push("step1");
          },
        },
        {
          id: "step2",
          title: "Step 2",
          run: async () => {
            executedSteps.push("step2");
          },
          when: () => false,
        },
        {
          id: "step3",
          title: "Step 3",
          run: async () => {
            executedSteps.push("step3");
          },
        },
      ];

      await runPipeline(mockContext, steps);
      expect(executedSteps).toEqual(["step1", "step3"]);
    });

    it("should throw error if step fails", async () => {
      const steps: Step[] = [
        {
          id: "failing-step",
          title: "Failing Step",
          run: async () => {
            throw new Error("Step failed");
          },
        },
      ];

      await expect(runPipeline(mockContext, steps)).rejects.toThrow(
        "Step failed",
      );
    });
  });
});
