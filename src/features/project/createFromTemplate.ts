import fs from "node:fs";
import path from "node:path";
import { run, cmdExists } from "@/core/exec";
import { TEMPLATES } from "@/templates";
import type { Context } from "@/core/context";

function ensureEmptyOrNonExistent(dir: string) {
  if (!fs.existsSync(dir)) return;
  const contents = fs.readdirSync(dir);
  if (contents.length > 0) {
    throw new Error(`Directory "${dir}" already exists and is not empty.`);
  }
}

export async function createProjectFromTemplate(ctx: Context) {
  ensureEmptyOrNonExistent(ctx.targetDir);

  const template = TEMPLATES[ctx.router];

  const ghAvailable = await cmdExists("gh");
  const useGh = ctx.github.enabled && ghAvailable;

  if (useGh) {
    await run("gh", [
      "repo",
      "create",
      ctx.projectName,
      "--template",
      template,
      ctx.github.visibility === "private" ? "--private" : "--public",
      "--clone",
    ]);
    return;
  }

  if (ctx.github.enabled && !ghAvailable) {
    console.warn(
      "\n  ⚠ GitHub CLI (gh) not found. Falling back to git clone.\n",
    );
  }

  await run("git", [
    "clone",
    "--depth=1",
    `https://github.com/${template}.git`,
    ctx.projectName,
  ]);

  fs.rmSync(path.join(ctx.targetDir, ".git"), { recursive: true, force: true });
}
