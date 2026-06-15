#!/usr/bin/env node

import { Command } from "commander";
import { listMobileDevices } from "./mcp-mobile-client.js";
import { runMobileTask } from "./mobile-agent.js";
import { PACKAGE_NAME, VERSION } from "./version.js";

const program = new Command();

program
  .name("mobile-agent")
  .description("Run mobile UI automation with Composer 2.5 Fast + mobile-mcp (Model B)")
  .version(VERSION);

program
  .command("run")
  .description("Execute a mobile automation task")
  .argument("<instruction>", "Natural language task for the device")
  .option("--device <id>", "Target device id from adb/simctl")
  .option("--timeout <sec>", "Timeout in seconds", "300")
  .option("--json", "Output JSON result")
  .action(async (instruction: string, opts: { device?: string; timeout: string; json?: boolean }) => {
    const timeoutMs = Number.parseInt(opts.timeout, 10) * 1000;
    const result = await runMobileTask({
      instruction,
      device: opts.device,
      timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : 300_000,
    });

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (result.error) {
        console.error(result.error);
      }
      console.log(result.summary);
    }

    process.exit(result.success ? 0 : 1);
  });

program
  .command("devices")
  .description("List available mobile devices (no LLM, direct mobile-mcp call)")
  .option("--json", "Output JSON")
  .action(async (opts: { json?: boolean }) => {
    const devices = await listMobileDevices();
    if (opts.json) {
      console.log(JSON.stringify({ version: VERSION, devices }, null, 2));
    } else {
      console.log(JSON.stringify(devices, null, 2));
    }
  });

program
  .command("version")
  .description("Print package version")
  .option("--json", "Output JSON")
  .action((opts: { json?: boolean }) => {
    const info = { name: PACKAGE_NAME, version: VERSION };
    console.log(opts.json ? JSON.stringify(info, null, 2) : `${PACKAGE_NAME} v${VERSION}`);
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
