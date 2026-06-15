/** Cheap model for mobile UI automation (Model B). Override via MOBILE_MODEL_ID env. */
export const MOBILE_MODEL_ID =
  process.env.MOBILE_MODEL_ID?.trim() || "composer-2.5-fast";

export const MOBILE_MCP_SERVER = {
  command: "npx",
  args: ["-y", "@mobilenext/mobile-mcp@latest"],
  env: {
    MOBILEMCP_DISABLE_TELEMETRY: "1",
  },
};
