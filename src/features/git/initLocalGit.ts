import fs from "node:fs";
import path from "node:path";
import { run, cmdExists } from "@/core/exec";
import type { Context } from "@/core/context";

/**
 * Ensures a Git repository exists in the target directory and creates an initial commit if needed.
 *
 * If a `.git` directory already exists in `ctx.targetDir`, or if the `git` command is unavailable, the function does nothing.
 *
 * @param ctx - Context whose `targetDir` is used as the repository root and working directory for git commands
 */
export async function initLocalGitIfNeeded(ctx: Context) {
  const gitDir = path.join(ctx.targetDir, ".git");

  // If gh created/cloned the repo, .git already exists
  if (fs.existsSync(gitDir)) return;

  const gitOk = await cmdExists("git");
  if (!gitOk) return;

  await run("git", ["init"], ctx.targetDir);
  await run("git", ["add", "."], ctx.targetDir);
  await run("git", ["commit", "-m", "chore: initial commit"], ctx.targetDir);
}
