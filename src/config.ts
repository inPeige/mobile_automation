/** Engine type: "cursor" (default) or "openai" (OpenAI-compatible API). */
export type EngineType = "cursor" | "openai";

export const ENGINE: EngineType =
  (process.env.MOBILE_ENGINE?.trim() as EngineType) || "cursor";

/** Cheap model for mobile UI automation (Model B). Override via MOBILE_MODEL_ID env. */
export const MOBILE_MODEL_ID =
  process.env.MOBILE_MODEL_ID?.trim() || "composer-2.5-fast";

/** OpenAI-compatible model ID (used when ENGINE=openai). */
export const OPENAI_MODEL_ID =
  process.env.OPENAI_MODEL_ID?.trim() || "deepseek-chat";

/** OpenAI-compatible base URL (used when ENGINE=openai). */
export const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL?.trim() || "https://api.deepseek.com/v1";

export const MOBILE_MCP_SERVER = {
  command: "npx",
  args: ["-y", "@mobilenext/mobile-mcp@latest"],
  env: {
    MOBILEMCP_DISABLE_TELEMETRY: "1",
  },
};
