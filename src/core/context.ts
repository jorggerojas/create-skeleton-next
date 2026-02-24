export type Router = "app" | "pages";
export type Manager = "pnpm" | "bun" | "npm" | "yarn";

export type Context = {
  projectName: string;
  targetDir: string;

  router: Router;

  github: {
    enabled: boolean;
    visibility: "private" | "public";
  };

  install: boolean;
  yes: boolean;

  shadcn: {
    enabled: boolean;
    components: string[];
  };

  manager: Manager;
};
