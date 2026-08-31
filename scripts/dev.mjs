import { spawn } from "node:child_process";

const input = process.argv.slice(2);
let hostname = "0.0.0.0";
let port = "3000";
const passthrough = [];

for (let index = 0; index < input.length; index += 1) {
  const argument = input[index];
  if (argument === "--host" || argument === "--hostname" || argument === "-H") {
    hostname = input[index + 1] ?? hostname;
    index += 1;
  } else if (argument === "--port" || argument === "-p") {
    port = input[index + 1] ?? port;
    index += 1;
  } else if (argument !== "--strictPort") {
    passthrough.push(argument);
  }
}

const child = spawn(
  "next",
  ["dev", "--hostname", hostname, "--port", port, ...passthrough],
  { stdio: "inherit", shell: process.platform === "win32" },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
