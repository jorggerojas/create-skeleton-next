import { run } from "@/core/exec";
import type { Context } from "@/core/context";

/**
 * Trigger the package manager to install dependencies in the context's target directory.
 *
 * @param ctx - Execution context containing `manager` (package manager command) and `targetDir` (working directory) used for the install operation
 */
export async function packageManagerInstall(ctx: Context) {
  await run(ctx.manager, ["install"], ctx.targetDir);
}
