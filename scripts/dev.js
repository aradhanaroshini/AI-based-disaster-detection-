import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];
let stopping = false;

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill("SIGINT");
  }
  const forceStop = setTimeout(() => {
    for (const child of children) {
      if (child.exitCode === null) child.kill("SIGTERM");
    }
  }, 4000);
  forceStop.unref();
}

function start(label, args, cwd) {
  const child = spawn(npm, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  children.push(child);
  child.on("error", error => {
    console.error(`${label} could not start: ${error.message}`);
    stopAll(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) {
      console.error(`${label} stopped${signal ? ` (${signal})` : ` (exit ${code})`}.`);
      stopAll(code || 1);
    }
  });
}

process.on("SIGINT", () => stopAll());
process.on("SIGTERM", () => stopAll());
console.log("Starting the TN Sentinel API and website. Press Ctrl+C to stop both.");
start("API", ["run", "dev"], path.join(root, "server"));
start("Website", ["run", "dev", "--", "--host", "0.0.0.0", "--port", "5179"], path.join(root, "client"));
