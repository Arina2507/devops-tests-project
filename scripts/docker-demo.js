const { spawnSync } = require("child_process");

const appUrl = "http://127.0.0.1:3001";
const healthUrl = `${appUrl}/health`;
const maxAttempts = 60;
const delayMs = 2000;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForHealth() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(healthUrl);

      if (response.ok) {
        return;
      }
    } catch (error) {
      // Server is still starting.
    }

    await wait(delayMs);
  }

  throw new Error("Application did not become healthy in time");
}

function openBrowser(url) {
  if (process.platform === "win32") {
    spawnSync("cmd", ["/c", "start", "", url], {
      stdio: "ignore",
      detached: true
    });
    return;
  }

  if (process.platform === "darwin") {
    spawnSync("open", [url], {
      stdio: "ignore",
      detached: true
    });
    return;
  }

  spawnSync("xdg-open", [url], {
    stdio: "ignore",
    detached: true
  });
}

async function main() {
  run("docker", ["compose", "up", "-d", "--build"]);
  await waitForHealth();
  openBrowser(appUrl);
  console.log(`Application is ready at ${appUrl}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
