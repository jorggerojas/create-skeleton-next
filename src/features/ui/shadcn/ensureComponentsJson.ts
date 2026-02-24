import fs from "node:fs";
import path from "node:path";
import type { Context } from "@/core/context";

/**
 * Validates that a `components.json` file exists in the template's target directory.
 *
 * @param ctx - Context containing `targetDir`, the template directory to check
 * @throws Error if `components.json` is not present in the target directory
 */
export function ensureComponentsJson(ctx: Context) {
  const componentsJsonPath = path.join(ctx.targetDir, "components.json");

  if (!fs.existsSync(componentsJsonPath)) {
    throw new Error(
      'Missing "components.json" in the template. ' +
        "The template must include a valid components.json file for shadcn/ui. " +
        "Please add it to the template repository.",
    );
  }
}
