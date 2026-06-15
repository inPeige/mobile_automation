import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { MOBILE_MCP_SERVER, MOBILE_MODEL_ID } from "./config.js";
import { buildMobileTaskPrompt } from "./prompts.js";
import { VERSION } from "./version.js";

export interface MobileTaskOptions {
  instruction: string;
  device?: string;
  timeoutMs?: number;
}

export interface MobileTaskResult {
  success: boolean;
  status: string;
  summary: string;
  version: string;
  runId?: string;
  durationMs?: number;
  error?: string;
}

interface AgentJsonOutput {
  result?: string;
  status?: string;
  error?: string;
}

function findAgentBinary(): string {
  const fromEnv = process.env.MOBILE_AGENT_BIN?.trim();
  if (fromEnv) return fromEnv;

  const home = process.env.HOME ?? "";
  const candidates = [
    join(home, ".cursor", "bin", "agent"),
    join(home, ".local", "bin", "agent"),
    "agent",
    "cursor-agent",
  ];

  for (const candidate of candidates) {
    if (candidate.includes("/") && existsSync(candidate)) {
      return candidate;
    }
  }

  return "agent";
}

function runAgentProcess(
  agentBin: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(agentBin, args, {
      cwd,
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

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Task timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, code });
    });
  });
}

function getAgentWorkspace(): string {
  const dir =
    process.env.MOBILE_AGENT_WORKSPACE?.trim() ||
    join(homedir(), ".local/share/mobile-automation/agent-workspace");
  const cursorDir = join(dir, ".cursor");
  mkdirSync(cursorDir, { recursive: true });

  const mcpPath = join(cursorDir, "mcp.json");
  if (!existsSync(mcpPath)) {
    writeFileSync(
      mcpPath,
      JSON.stringify(
        {
          mcpServers: {
            "mobile-mcp": {
              command: MOBILE_MCP_SERVER.command,
              args: MOBILE_MCP_SERVER.args,
              env: MOBILE_MCP_SERVER.env,
            },
          },
        },
        null,
        2,
      ),
    );
  }

  return dir;
}

function parseAgentOutput(stdout: string): AgentJsonOutput {
  const trimmed = stdout.trim();
  if (!trimmed) return {};

  try {
    return JSON.parse(trimmed) as AgentJsonOutput;
  } catch {
    // Plain text fallback when --output-format json is unsupported
    return { result: trimmed, status: "finished" };
  }
}

export async function runMobileTask(
  options: MobileTaskOptions,
): Promise<MobileTaskResult> {
  const { instruction, device, timeoutMs = 300_000 } = options;
  const prompt = buildMobileTaskPrompt(instruction, device);
  const agentBin = findAgentBinary();
  const workspace = getAgentWorkspace();
  const started = Date.now();

  try {
    const args = [
      "--trust",
      "--force",
      "--approve-mcps",
      "-p",
      prompt,
      "--model",
      MOBILE_MODEL_ID,
      "--output-format",
      "json",
    ];

    const { stdout, stderr, code } = await runAgentProcess(
      agentBin,
      args,
      workspace,
      timeoutMs,
    );

    const parsed = parseAgentOutput(stdout);
    const summary =
      parsed.result?.trim() ??
      stderr.trim() ??
      stdout.trim() ??
      "No output from agent.";

    const success = code === 0 && parsed.status !== "error";

    return {
      success,
      status: parsed.status ?? (success ? "finished" : "error"),
      summary,
      version: VERSION,
      durationMs: Date.now() - started,
      error: success ? undefined : stderr.trim() || `agent exited with code ${code}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const hint =
      message.includes("ENOENT") || message.includes("spawn")
        ? `${message}. Install Cursor CLI: curl https://cursor.com/install -fsS | bash`
        : message;

    return {
      success: false,
      status: "error",
      summary: "",
      version: VERSION,
      durationMs: Date.now() - started,
      error: hint,
    };
  }
}
