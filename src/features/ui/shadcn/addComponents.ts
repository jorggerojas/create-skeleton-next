import { run, runWithOutput } from "@/core/exec";
import type { Context, Manager } from "@/core/context";
import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";

export async function shadcnAddComponents(ctx: Context) {
  if (!ctx.shadcn.components.length) return;

  try {
    // verify if src/lib/utils.ts exists
    const utilsPathExists = fs.existsSync(
      path.join(ctx.targetDir, "src", "lib", "utils.ts"),
    );
    if (!utilsPathExists) {
      // Create src/lib/utils.ts before running shadcn add
      const libDir = path.join(ctx.targetDir, "src", "lib");
      const utilsPath = path.join(libDir, "utils.ts");

      // Ensure the lib directory exists
      fs.mkdirSync(libDir, { recursive: true });

      // Write utils.ts content
      const utilsContent = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;

      fs.writeFileSync(utilsPath, utilsContent, "utf-8");
    }
  } catch (error) {
    console.error(
      "Failed to create lib/utils.ts, continuing with shadcn add",
      error,
    );
  }

  const baseArgs = ["add", "-y", ...ctx.shadcn.components];

  const getYarnShadcnConfig = async (): Promise<{
    cmd: string;
    args: string[];
  }> => {
    try {
      const version = await runWithOutput("yarn", ["--version"], ctx.targetDir);
      const major = Number.parseInt(
        String(version).trim().split(".")[0] ?? "1",
        10,
      );
      if (major >= 2) {
        return { cmd: "yarn", args: ["dlx", "shadcn@latest", ...baseArgs] };
      }
    } catch {
      // yarn not in PATH or failed
    }
    // Yarn 1.x has no dlx; fall back to npx
    return { cmd: "npx", args: ["shadcn@latest", ...baseArgs] };
  };

  const shadcnConfig: Record<
    Manager,
    | { cmd: string; args: string[] }
    | (() => Promise<{ cmd: string; args: string[] }>)
  > = {
    pnpm: { cmd: "pnpm", args: ["dlx", "shadcn@latest", ...baseArgs] },
    bun: { cmd: "bunx", args: ["--bun", "shadcn@latest", ...baseArgs] },
    npm: { cmd: "npx", args: ["shadcn@latest", ...baseArgs] },
    yarn: getYarnShadcnConfig,
  };

  const config =
    typeof shadcnConfig[ctx.manager] === "function"
      ? await (
          shadcnConfig[ctx.manager] as () => Promise<{
            cmd: string;
            args: string[];
          }>
        )()
      : (shadcnConfig[ctx.manager] as { cmd: string; args: string[] });

  try {
    console.log(pc.cyan("\ninstalling tailwind-merge\n"));
    const installCommandDev = ctx.manager === "npm" ? ["install"] : ["add"];
    await run(
      ctx.manager,
      [...installCommandDev, "tailwind-merge"],
      ctx.targetDir,
    );
  } catch (error) {
    console.error(
      pc.red(
        "\nFailed to install tailwind-merge, continuing with shadcn add. You may need to install it manually.\n",
      ),
      error,
    );
  }

  await run(config.cmd, config.args, ctx.targetDir);
}
