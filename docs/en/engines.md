# Dual-Model Architecture & Engine Switching

[中文](../zh/engines.md)

## Why two models

Mobile automation is repetitive. Letting your IDE’s **expensive model** call `mobile_click` step-by-step burns tokens.

| Role | Where | Typical model | Job |
|------|-------|---------------|-----|
| **Model A** | IDE chat | Sonnet, Opus, GPT-4, … | Code, logs, decisions |
| **Model B** | `mobile-agent` | `composer-2.5-fast` | Full mobile-mcp loop |

Model A only sees **3 high-level MCP tools**.

## Call chain

```
Model A → mobile_run_task (once)
       → mobile-agent → agent + mobile-mcp (Model B loop)
       → summary back to Model A
```

No LLM: `mobile_list_devices`, `mobile_get_version`

## Switch Model B

### Environment variable (recommended)

```bash
export MOBILE_MODEL_ID="composer-2.5-fast"
```

Or set in MCP `env`, then restart MCP.

### Source default

Edit `src/config.ts`, then `bash scripts/install-global.sh`.

### List models

```bash
agent --list-models
```

| Model ID | Notes |
|----------|-------|
| `composer-2.5-fast` | Default; fast and cheap |
| `composer-2.5` | Slightly stronger |
| `auto` | Cursor picks |

## Model A

Chosen in your IDE — not configured here. Use **mobile-bridge** + `mobile_run_task`.

## Other

- mobile-mcp version: edit `MOBILE_MCP_SERVER` in `src/config.ts`
- `MOBILE_AGENT_BIN`: path to `agent`

## Cost comparison

| Approach | Model A calls | Model B |
|----------|---------------|---------|
| IDE → mobile-mcp directly | N | Mixed with A |
| **mobile-bridge** | 1 | N (cheap only) |
