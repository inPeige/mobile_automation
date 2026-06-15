#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { listMobileDevices } from "./mcp-mobile-client.js";
import { runMobileTaskAuto } from "./mobile-agent.js";
import { VERSION } from "./version.js";

const RunTaskSchema = z.object({
  instruction: z.string().min(1).describe("Mobile UI task to perform"),
  device: z.string().optional().describe("Optional device id"),
  timeout_sec: z.number().int().positive().optional().default(300),
});

const server = new Server(
  {
    name: "mobile-bridge",
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mobile_run_task",
      description:
        "Run a mobile UI automation task on Android/iOS using Composer 2.5 Fast (cheap model). " +
        "Use this instead of direct mobile-mcp tools to save cost. Returns success/failure summary.",
      inputSchema: {
        type: "object",
        properties: {
          instruction: {
            type: "string",
            description: "Detailed task, e.g. launch app, navigate, tap, verify screen",
          },
          device: {
            type: "string",
            description: "Optional device id from mobile_list_devices",
          },
          timeout_sec: {
            type: "number",
            description: "Max seconds before timeout (default 300)",
          },
        },
        required: ["instruction"],
      },
    },
    {
      name: "mobile_list_devices",
      description:
        "List available Android/iOS devices (emulators, simulators, real devices). No LLM cost.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "mobile_get_version",
      description: "Get mobile-bridge package version (no LLM cost).",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "mobile_get_version") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ version: VERSION }, null, 2),
        },
      ],
    };
  }

  if (name === "mobile_list_devices") {
    const devices = await listMobileDevices();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(devices, null, 2),
        },
      ],
    };
  }

  if (name === "mobile_run_task") {
    const parsed = RunTaskSchema.safeParse(args ?? {});
    if (!parsed.success) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Invalid arguments: ${parsed.error.message}`,
          },
        ],
      };
    }

    const { instruction, device, timeout_sec } = parsed.data;
    const result = await runMobileTaskAuto({
      instruction,
      device,
      timeoutMs: timeout_sec * 1000,
    });

    const content: Array<{ type: string; text?: string; data?: string; mimeType?: string; uri?: string; name?: string; description?: string; annotations?: Record<string, unknown> }> = [
      { type: "text", text: JSON.stringify({ ...result, screenshotPaths: undefined }, null, 2) },
    ];

    // Return screenshots as resource_link — no base64 in context, IDE fetches on demand
    if (result.screenshotPaths?.length) {
      for (const filepath of result.screenshotPaths) {
        const filename = filepath.split("/").pop() ?? "screenshot.png";
        content.push({
          type: "resource_link",
          uri: `file://${filepath}`,
          name: filename,
          description: "Screenshot taken during task execution",
          mimeType: "image/png",
          annotations: { audience: ["user"], priority: 0.9 },
        });
      }
    }

    return { content, isError: !result.success };
  }

  return {
    isError: true,
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
  };
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
