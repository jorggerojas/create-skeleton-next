import semver from "semver";
import updateNotifier from "update-notifier";
import pc from "picocolors";
import packageJson from "../../../package.json";

export async function checkForUpdates() {
  const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 60 * 24, // 1 day
    distTag: "latest",
    shouldNotifyInNpmScript: true,
  });

  // check() spawns a background process to fetch the latest version and caches
  // the result. On subsequent runs within the interval, .update is populated
  // from cache (zero network latency).
  notifier.check();

  if (
    notifier.update &&
    semver.gt(notifier.update.latest, notifier.update.current)
  ) {
    notifier.notify({
      defer: false,
      message: [
        `${pc.bold("create-skeleton-next")}`,
        `Update available: ${notifier.update.current} → ${pc.bold(notifier.update.latest)}`,
        `Run ${pc.cyan("pnpm install -g create-skeleton-next")} to update`,
      ].join("\n"),
      isGlobal: true,
      boxenOptions: {
        borderColor: "yellow",
        borderStyle: "round",
        padding: 1,
        margin: 1,
      },
    });
  }
}
