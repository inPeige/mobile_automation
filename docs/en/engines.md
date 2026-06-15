# Dual-Model Architecture & Engine Switching

[中文](../zh/engines.md)

## Why two models

Mobile automation is repetitive. Letting your IDE's **expensive model** call `mobile_click` step-by-step burns tokens.

| Role | Where | Typical model | Job |
|------|-------|---------------|-----|
| **Model A** | IDE chat | Sonnet, Opus, GPT-4, … | Code, logs, decisions |
| **Model B** | `mobile-agent` | `composer-2.5-fast` / DeepSeek / … | Full mobile-mcp loop |

Model A only sees **3 high-level MCP tools**.

## Call chain

```
Model A → mobile_run_task (once)
       → mobile-agent → Engine (Model B loop)
       → summary back to Model A
```

No LLM: `mobile_list_devices`, `mobile_get_version`

## Engines

mobile-automation supports two engine backends for Model B:

| Engine | `MOBILE_ENGINE` | Requires | Notes |
|--------|----------------|----------|-------|
| **Cursor CLI** | `cursor` (default) | Cursor CLI `agent` binary | Uses Cursor's models |
| **OpenAI-compatible** | `openai` | `OPENAI_API_KEY` | DeepSeek, GPT-4o, Qwen, etc. |

## Engine: Cursor CLI (default)

### Switch Model B

```bash
export MOBILE_MODEL_ID="composer-2.5-fast"
```

Or set in MCP `env`, then restart MCP.

### List models

```bash
agent --list-models
```

| Model ID | Notes |
|----------|-------|
| `composer-2.5-fast` | Default; fast and cheap |
| `composer-2.5` | Slightly stronger |
| `auto` | Cursor picks |

## Engine: OpenAI-compatible API

Use any model that supports the OpenAI chat completions API with function calling (tool use). This includes **DeepSeek**, **GPT-4o**, **Qwen**, **GLM**, and many others.

### Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MOBILE_ENGINE` | Yes | `cursor` | Set to `openai` to use this engine |
| `OPENAI_API_KEY` | Yes | — | Your API key |
| `OPENAI_MODEL_ID` | No | `deepseek-chat` | Model ID to call |
| `OPENAI_BASE_URL` | No | `https://api.deepseek.com/v1` | API base URL |

### Example: DeepSeek

```bash
export MOBILE_ENGINE=openai
export OPENAI_API_KEY=sk-your-deepseek-key
export OPENAI_MODEL_ID=deepseek-chat
export OPENAI_BASE_URL=https://api.deepseek.com/v1
```

MCP config (`~/.cursor/mcp.json` or `~/.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "mobile-bridge": {
      "command": "mobile-bridge-mcp",
      "env": {
        "MOBILEMCP_DISABLE_TELEMETRY": "1",
        "MOBILE_ENGINE": "openai",
        "OPENAI_API_KEY": "sk-your-deepseek-key",
        "OPENAI_MODEL_ID": "deepseek-chat",
        "OPENAI_BASE_URL": "https://api.deepseek.com/v1"
      }
    }
  }
}
```

### Example: OpenAI GPT-4o

```bash
export MOBILE_ENGINE=openai
export OPENAI_API_KEY=sk-your-openai-key
export OPENAI_MODEL_ID=gpt-4o
export OPENAI_BASE_URL=https://api.openai.com/v1
```

### Example: Qwen (Alibaba DashScope)

```bash
export MOBILE_ENGINE=openai
export OPENAI_API_KEY=sk-your-dashscope-key
export OPENAI_MODEL_ID=qwen-plus
export OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### How it works

When `MOBILE_ENGINE=openai`, mobile-agent:

1. Starts a local mobile-mcp process and discovers its tools
2. Sends the task prompt + tool definitions to the OpenAI-compatible model
3. Executes tool calls returned by the model against mobile-mcp
4. Loops until the model finishes (stop) or hits max iterations (30)
5. Returns the summary to Model A

No Cursor CLI is needed in this mode.

## Model A

Chosen in your IDE — not configured here. Use **mobile-bridge** + `mobile_run_task`.

## Other

- mobile-mcp version: edit `MOBILE_MCP_SERVER` in `src/config.ts`
- `MOBILE_AGENT_BIN`: path to `agent` (cursor engine only)

## Cost comparison

| Approach | Model A calls | Model B |
|----------|---------------|---------|
| IDE → mobile-mcp directly | N | Mixed with A |
| **mobile-bridge (cursor)** | 1 | N (Cursor cheap model) |
| **mobile-bridge (openai)** | 1 | N (your chosen API) |
