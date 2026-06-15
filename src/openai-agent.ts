import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { withMobileMcpClient } from "./mcp-mobile-client.js";
import { OPENAI_BASE_URL, OPENAI_MODEL_ID } from "./config.js";
import { buildMobileTaskPrompt } from "./prompts.js";
import type { MobileTaskOptions, MobileTaskResult } from "./mobile-agent.js";
import { VERSION } from "./version.js";

const MAX_ITERATIONS = 30;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY env is required for openai engine");
  return new OpenAI({ apiKey, baseURL: OPENAI_BASE_URL });
}

function mcpToolsToOpenAI(tools: Array<{ name: string; description?: string; inputSchema?: unknown }>): ChatCompletionTool[] {
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description ?? "",
      parameters: (t.inputSchema as Record<string, unknown>) ?? { type: "object", properties: {} },
    },
  }));
}

function getScreenshotDir(): string {
  const dir = join(homedir(), ".local/share/mobile-automation/screenshots");
  mkdirSync(dir, { recursive: true });
  return dir;
}

interface McpContentItem {
  type: string;
  text?: string;
  data?: string;
  mimeType?: string;
}

export async function runMobileTaskOpenAI(options: MobileTaskOptions): Promise<MobileTaskResult> {
  const { instruction, device, timeoutMs = 300_000 } = options;
  const started = Date.now();
  const screenshotPaths: string[] = [];
  const screenshotDir = getScreenshotDir();
  let screenshotIdx = 0;

  try {
    const result = await withMobileMcpClient(async (client) => {
      const { tools: mcpTools } = await client.listTools();
      const tools = mcpToolsToOpenAI(mcpTools as Array<{ name: string; description?: string; inputSchema?: unknown }>);

      const openai = getOpenAIClient();
      const systemPrompt = buildMobileTaskPrompt(instruction, device);

      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: instruction },
      ];

      for (let i = 0; i < MAX_ITERATIONS; i++) {
        if (Date.now() - started > timeoutMs) {
          return { success: false, status: "timeout", summary: "Task timed out" };
        }

        const response = await openai.chat.completions.create({
          model: OPENAI_MODEL_ID,
          messages,
          tools,
          tool_choice: "auto",
        });

        const choice = response.choices[0];
        if (!choice) return { success: false, status: "error", summary: "No response from model" };

        const msg = choice.message;
        messages.push(msg as ChatCompletionMessageParam);

        if (choice.finish_reason === "stop" || !msg.tool_calls?.length) {
          return { success: true, status: "finished", summary: msg.content ?? "Task completed" };
        }

        for (const tc of msg.tool_calls) {
          let toolResult: string;
          try {
            const args = JSON.parse(tc.function.arguments || "{}");
            const mcpResult = await client.callTool({ name: tc.function.name, arguments: args });
            const contentItems = mcpResult.content as McpContentItem[] | undefined;

            if (contentItems) {
              for (const item of contentItems) {
                if (item.type === "image" && item.data && item.mimeType) {
                  const ext = item.mimeType.split("/")[1] || "png";
                  const filename = `${Date.now()}-${screenshotIdx++}.${ext}`;
                  const filepath = join(screenshotDir, filename);
                  writeFileSync(filepath, Buffer.from(item.data, "base64"));
                  screenshotPaths.push(filepath);
                }
              }
            }

            toolResult = JSON.stringify(contentItems);
          } catch (err) {
            toolResult = `Error: ${err instanceof Error ? err.message : String(err)}`;
          }
          messages.push({ role: "tool", tool_call_id: tc.id, content: toolResult });
        }
      }

      return { success: false, status: "max_iterations", summary: "Reached max iterations without completion" };
    });

    return {
      ...result,
      version: VERSION,
      durationMs: Date.now() - started,
      screenshotPaths: screenshotPaths.length > 0 ? screenshotPaths : undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      status: "error",
      summary: "",
      version: VERSION,
      durationMs: Date.now() - started,
      error: message,
    };
  }
}
