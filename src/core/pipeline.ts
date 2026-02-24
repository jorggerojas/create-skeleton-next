import pc from "picocolors";
import type { Context } from "@/core/context";

export type Step = {
  id: string;
  title: string;
  run: (ctx: Context) => Promise<void>;
  when?: (ctx: Context) => boolean;
};

export async function runPipeline(ctx: Context, steps: Step[]) {
  for (const step of steps) {
    if (step.when && !step.when(ctx)) {
      console.log(pc.dim(`  ○ ${step.title} (skipped)`));
      continue;
    }

    process.stdout.write(pc.yellow(`  ◌ ${step.title}...`));

    try {
      await step.run(ctx);
      process.stdout.write(`\r${pc.green(`  ● ${step.title}`)}\n`);
    } catch (error) {
      process.stdout.write(`\r${pc.red(`  ✖ ${step.title}`)}\n`);
      throw error;
    }
  }
}
