import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  // TypeScript 7 dropped ts.sys; tsup's rollup-plugin-dts still requires it.
  dts: false,
  clean: true,
  // update-notifier and semver use CJS patterns that break when bundled as ESM
  external: ["update-notifier", "semver"],
});
