import prompts from "prompts";
import type { Manager, Router } from "@/core/context";
import { DEFAULTS } from "@/config/defaults";
import { cmdExists } from "@/core/exec";

type PromptAnswers = {
  projectName?: string;
  router?: Router;
  github?: boolean;
  visibility?: "public" | "private";
  install?: boolean;
  manager?: Manager;
};

/**
 * Interactively prompt for any missing project setup options and return a complete options object.
 *
 * If a value is provided via the corresponding initial/flag parameter, that value is used; otherwise the function will prompt the user for it (unless `yesFlag` is true, in which case defaults are returned immediately).
 *
 * @param initialProjectName - Optional initial project name; when omitted the user will be prompted for a name.
 * @param initialRouter - Optional initial router choice ("app" or "pages"); when omitted the user will be prompted to choose.
 * @param initialManager - Optional initial package manager ("pnpm" | "bun" | "npm" | "yarn"); when omitted the user will be prompted to choose.
 * @param githubFlag - If `true` or `false`, explicitly enable or disable GitHub repo creation; when `undefined` the user will be prompted.
 * @param visibilityFlag - If provided ("public" or "private"), sets repository visibility; when `undefined` the user will be prompted if GitHub creation is enabled.
 * @param installFlag - If `true` or `false`, explicitly enable or disable installing dependencies; when `undefined` the user will be prompted.
 * @param yesFlag - When `true`, skip all prompts and return defaults merged with any provided initial/flag values.
 * @returns An object containing all required prompt answers: `projectName`, `router`, `manager`, `github`, `visibility`, and `install`.
 */
export async function promptForMissingOptions(
  initialProjectName?: string,
  initialRouter?: Router,
  initialManager?: Manager,
  githubFlag?: boolean,
  visibilityFlag?: "public" | "private",
  installFlag?: boolean,
  yesFlag?: boolean,
): Promise<Required<PromptAnswers>> {
  let packageManager = initialManager ?? DEFAULTS.manager;
  // If --yes flag is used, return all defaults immediately
  if (yesFlag) {
    return {
      projectName: initialProjectName ?? DEFAULTS.projectName,
      router: initialRouter ?? DEFAULTS.router,
      manager: packageManager,
      github: githubFlag ?? DEFAULTS.github.enabled,
      visibility: visibilityFlag ?? DEFAULTS.github.visibility,
      install: installFlag ?? DEFAULTS.install,
    };
  }

  const ghAvailable = await cmdExists("gh");

  const questions: prompts.PromptObject[] = [];

  // Project name
  if (!initialProjectName) {
    questions.push({
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: DEFAULTS.projectName,
    });
  }

  // Manager
  if (!initialManager) {
    const answers = await prompts({
      type: "select",
      name: "manager",
      message: "Which package manager do you want to use? (default: pnpm)",
      choices: [
        { title: "pnpm", value: "pnpm" },
        { title: "bun", value: "bun" },
        { title: "npm", value: "npm" },
        { title: "yarn", value: "yarn" },
      ],
      initial: 0,
    });
    packageManager = answers?.manager ?? packageManager;
  }

  // Router
  if (!initialRouter) {
    questions.push({
      type: "select",
      name: "router",
      message: "Which router do you want to use?",
      choices: [
        { title: "App Router (recommended)", value: "app" },
        { title: "Pages Router", value: "pages" },
      ],
      initial: 0,
    });
  }

  // GitHub creation
  if (githubFlag === undefined) {
    questions.push({
      type: "confirm",
      name: "github",
      message: ghAvailable
        ? "Create GitHub repository with gh CLI?"
        : "Create GitHub repository? (gh CLI not found, will use git clone)",
      initial: DEFAULTS.github.enabled,
    });
  }

  // GitHub visibility (only if github is enabled)
  if (visibilityFlag === undefined) {
    questions.push({
      type: (_prev, values) => {
        const shouldAsk = values.github ?? githubFlag ?? false;
        return shouldAsk ? "select" : null;
      },
      name: "visibility",
      message: "Repository visibility:",
      choices: [
        { title: "Private", value: "private" },
        { title: "Public", value: "public" },
      ],
      initial: 0,
    });
  }

  // Install dependencies
  if (installFlag === undefined) {
    questions.push({
      type: "confirm",
      name: "install",
      message: `Install dependencies with ${packageManager}?`,
      initial: DEFAULTS.install,
    });
  }

  const answers = await prompts(questions, {
    onCancel: () => {
      console.log("\n❌ Operation cancelled by user\n");
      process.exit(0);
    },
  });

  return {
    projectName:
      initialProjectName ?? answers?.projectName ?? DEFAULTS.projectName,
    router: initialRouter ?? answers?.router ?? DEFAULTS.router,
    github: githubFlag ?? answers?.github ?? DEFAULTS.github.enabled,
    visibility:
      visibilityFlag ?? answers?.visibility ?? DEFAULTS.github.visibility,
    install: installFlag ?? answers?.install ?? DEFAULTS.install,
    manager: packageManager,
  };
}
