import { spawn } from "node:child_process";
import type { MobileTaskResult } from "./mobile-agent.js";
import { VERSION } from "./version.js";

function resolveMobileAgentBin(): string {
  return process.env.MOBILE_AGENT_BIN?.trim() || "mobile-agent";
}

export function runMobileTaskViaCli(options: {
  instruction: string;
  device?: string;
  timeoutSec?: number;
}): Promise<MobileTaskResult> {
  const { instruction, device, timeoutSec = 300 } = options;
  const bin = resolveMobileAgentBin();
  const args = ["run", instruction, "--json", "--timeout", String(timeoutSec)];
  if (device) {
    args.push("--device", device);
  }

  return new Promise((resolve) => {
    const child = spawn(bin, args, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      resolve({
        success: false,
        status: "error",
        summary: "",
        version: VERSION,
        error: err.message,
      });
    });

    child.on("close", (code) => {
      const trimmed = stdout.trim();
      if (trimmed) {
        try {
          resolve(JSON.parse(trimmed) as MobileTaskResult);
          return;
        } catch {
          // fall through
        }
      }

      resolve({
        success: code === 0,
        status: code === 0 ? "finished" : "error",
        summary: trimmed || stderr.trim() || "No output from mobile-agent",
        version: VERSION,
        error: code === 0 ? undefined : stderr.trim() || `mobile-agent exited ${code}`,
      });
    });
  });
}
