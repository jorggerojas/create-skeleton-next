#!/usr/bin/env node
import path from "node:path";
import pc from "picocolors";
import { Command } from "commander";
import { DEFAULTS } from "@/config/defaults";
import { runPipeline, type Step } from "@/core/pipeline";
import { createProjectFromTemplate } from "@/features/project/createFromTemplate";
import { packageManagerInstall } from "@/features/deps/packageManagerInstall";
import { ensureComponentsJson } from "@/features/ui/shadcn/ensureComponentsJson";
import { shadcnAddComponents } from "@/features/ui/shadcn/addComponents";
import { initLocalGitIfNeeded } from "@/features/git/initLocalGit";
import type { Context, Manager, Router } from "@/core/context";
import { promptForMissingOptions } from "@/core/prompts";

/**
 * Prints an error message in red to stderr and terminates the process with exit code 1.
 *
 * @param msg - The error message to display
 */
function die(msg: string): never {
  console.error(pc.red(`\n✖ ${msg}\n`));
  process.exit(1);
}

/**
 * CLI entrypoint that scaffolds a Next.js project from skeleton templates.
 *
 * Parses command-line options (project name, router, GitHub settings, package
 * manager and install flags), prompts for any missing values (unless run with
 * --yes), constructs a project context, executes the creation pipeline
 * (project templating, optional dependency installation, shadcn component
 * handling, and Git initialization), and prints next-step instructions.
 */
async function main() {
  const program = new Command();

  program
    .name("create-skeleton-next")
    .description("Scaffold Next.js projects from skeleton templates")
    .version("0.1.0")
    .argument("[projectName]", "Name of the project to create")
    .option("-y, --yes", "Run with defaults, no prompts", false)
    .option("--router <router>", "Router type: app | pages")
    .option("--github", "Create GitHub repo with gh CLI")
    .option("--no-github", "Skip GitHub repo creation")
    .option("--public", "Make GitHub repo public")
    .option("--private", "Make GitHub repo private (default)")
    .option("--install", "Run pnpm install after creation")
    .option("--no-install", "Skip pnpm install")
    .parse(process.argv);

  const opts = program.opts<{
    yes: boolean;
    router?: string;
    github?: boolean;
    public?: boolean;
    private?: boolean;
    install?: boolean;
    manager?: Manager;
  }>();

  // Validate router if provided
  if (opts.router && opts.router !== "app" && opts.router !== "pages") {
    die(`Invalid router type: "${opts.router}". Use "app" or "pages".`);
  }

  // Determine values from flags or leave undefined for prompts
  const initialProjectName = program.args[0] as string | undefined;
  const initialRouter = opts.router as Router | undefined;
  const githubFlag = opts.github;
  let visibilityFlag: "public" | "private" = DEFAULTS.github.visibility;
  if (opts.public) {
    visibilityFlag = "public";
  }
  const installFlag = opts.install;
  const initialManager = opts.manager;

  // Prompt for missing options (unless --yes is used)
  const answers = await promptForMissingOptions(
    initialProjectName,
    initialRouter,
    initialManager,
    githubFlag,
    visibilityFlag,
    installFlag,
    opts.yes,
  );

  const ctx: Context = {
    projectName: answers.projectName,
    targetDir: path.resolve(process.cwd(), answers.projectName),
    router: answers.router,
    yes: opts.yes,
    install: answers.install,
    github: {
      enabled: answers.github,
      visibility: answers.visibility,
    },
    shadcn: {
      enabled: true,
      components: [...DEFAULTS.shadcn.components],
    },
    manager: answers.manager,
  };

  const steps: Step[] = [
    {
      id: "project:create",
      title: "Creating project from template",
      run: createProjectFromTemplate,
    },
    {
      id: "deps:install",
      title: "Installing dependencies",
      run: packageManagerInstall,
      when: (c) => c.install,
    },
    {
      id: "shadcn:check",
      title: "Checking components.json",
      run: async (c) => ensureComponentsJson(c),
    },
    {
      id: "shadcn:add",
      title: "Adding shadcn components",
      run: shadcnAddComponents,
      when: (c) => c.shadcn.enabled && c.shadcn.components.length > 0,
    },
    {
      id: "git:init",
      title: "Initializing git repository",
      run: initLocalGitIfNeeded,
    },
  ];

  console.log(
    pc.cyan(
      `\n▶ ${pc.bold("create-skeleton-next")} → ${pc.bold(ctx.projectName)}`,
    ),
  );
  console.log(
    pc.dim(
      `  router: ${ctx.router} | github: ${
        ctx.github.enabled ? ctx.github.visibility : "no"
      } | install: ${ctx.install}`,
    ),
  );
  console.log();

  await runPipeline(ctx, steps);

  console.log(pc.green("\n✔ Project created successfully!\n"));

  if (ctx.install) {
    console.log(pc.white("Next steps:\n"));
    console.log(pc.cyan(`  cd ${ctx.projectName}`));
    console.log(pc.cyan("  pnpm dev\n"));
  } else {
    console.log(pc.white("Next steps:\n"));
    console.log(pc.cyan(`  cd ${ctx.projectName}`));
    console.log(pc.cyan("  pnpm install"));
    console.log(pc.cyan("  pnpm dev\n"));
  }
}

try {
  await main();
} catch (error) {
  const msg = error instanceof Error ? error.message : String(error);
  die(msg);
}
