# IDE Integrations

[中文](../zh/integrations.md)

> **Android physical device**: enable developer mode, USB debugging, and **USB debugging (security settings)** before simulated taps. See [device-requirements.md](./device-requirements.md).

All IDEs use the same global command `mobile-bridge-mcp` in **user-level** MCP config.

## Cursor

`~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mobile-bridge": {
      "command": "mobile-bridge-mcp",
      "env": {
        "MOBILEMCP_DISABLE_TELEMETRY": "1",
        "MOBILE_MODEL_ID": "composer-2.5-fast"
      }
    }
  }
}
```

Save → confirm green MCP status / Reload Window → use in Agent mode.

## Kiro

`~/.kiro/settings/mcp.json` — same block.

## Claude Desktop / Claude Code

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```bash
claude mcp add mobile-bridge -- mobile-bridge-mcp
```

## Windsurf / Cline / Continue

Generic stdio: command `mobile-bridge-mcp`, env from `config/mcp.json.example`.

## MCP tools

| Tool | Description |
|------|-------------|
| `mobile_get_version` | Bridge version |
| `mobile_list_devices` | List devices (no LLM) |
| `mobile_run_task` | UI task (Model B) |

```json
{
  "instruction": "Launch com.example.app and tap Sign in",
  "device": "emulator-5554",
  "timeout_sec": 300
}
```

## CLI

```bash
mobile-agent devices --json
mobile-agent run "your task" --device ID --timeout 600 --json
```

## Typical workflow

1. Model A edits code  
2. Install app on device  
3. Ask IDE: “use mobile_run_task to verify …”  
4. Model B runs UI and returns summary  
5. Model A iterates  

Do **not** connect mobile-mcp low-level tools directly to Model A.
