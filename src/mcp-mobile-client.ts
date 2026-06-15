import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { MOBILE_MCP_SERVER } from "./config.js";

export async function withMobileMcpClient<T>(
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const transport = new StdioClientTransport({
    command: MOBILE_MCP_SERVER.command,
    args: MOBILE_MCP_SERVER.args,
    env: { ...process.env, ...MOBILE_MCP_SERVER.env },
  });

  const client = new Client(
    { name: "mobile-automation-client", version: "1.0.0" },
    { capabilities: {} },
  );

  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

export async function listMobileDevices(): Promise<unknown> {
  return withMobileMcpClient(async (client) => {
    const result = await client.callTool({
      name: "mobile_list_available_devices",
      arguments: {},
    });
    return result;
  });
}
