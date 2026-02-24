import fs from "node:fs";
import path from "node:path";
import { run, cmdExists } from "@/core/exec";
import type { Context } from "@/core/context";

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
