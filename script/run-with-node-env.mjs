import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const [, , nodeEnv, command, ...args] = process.argv;

if (!nodeEnv || !command) {
  console.error("Usage: node script/run-with-node-env.mjs <NODE_ENV> <command> [args...]");
  process.exit(1);
}

const resolveCommand = (inputCommand) => {
  if (process.platform !== "win32") {
    return inputCommand;
  }

  const absoluteCommand = resolve(inputCommand);
  const commandWithCmd = `${absoluteCommand}.cmd`;
  if (existsSync(commandWithCmd)) {
    return commandWithCmd;
  }

  if (existsSync(absoluteCommand)) {
    return absoluteCommand;
  }

  return inputCommand;
};

const resolvedCommand = resolveCommand(command);
const env = {
  ...process.env,
  NODE_ENV: nodeEnv,
};

const quoteForCmd = (value) => {
  if (!value.length) return '""';
  if (!/[ \t"]/u.test(value)) return value;
  return `"${value.replace(/"/g, '\\"')}"`;
};

const child = resolvedCommand.toLowerCase().endsWith(".cmd")
  ? spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `${quoteForCmd(resolvedCommand)} ${args.map(quoteForCmd).join(" ")}`], {
      stdio: "inherit",
      shell: false,
      env,
    })
  : spawn(resolvedCommand, args, {
      stdio: "inherit",
      shell: false,
      env,
    });

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", forwardSignal);
process.on("SIGTERM", forwardSignal);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
