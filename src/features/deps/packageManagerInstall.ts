import { run } from "@/core/exec";
import type { Context } from "@/core/context";

export async function packageManagerInstall(ctx: Context) {
  await run(ctx.manager, ["install"], ctx.targetDir);
}
