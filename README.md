# mobile-automation

**Cost-efficient mobile UI automation for AI IDEs** — a dual-model MCP bridge over [mobile-mcp](https://github.com/mobile-next/mobile-mcp).

Use **Model A** (your IDE’s main model) for coding and analysis. Delegate taps, swipes, and full UI flows to **Model B** (`composer-2.5-fast` by default) via a single high-level MCP call.

[中文文档](./README.zh-CN.md) · [Full docs (EN)](./docs/en/README.md) · [完整文档 (中文)](./docs/zh/README.md)

---

## Why this exists

Connecting mobile-mcp directly to Cursor/Kiro lets your **expensive model** decide every click — dozens of tool calls per task.

**mobile-automation** exposes only 3 MCP tools:

| Tool | LLM cost | Purpose |
|------|----------|---------|
| `mobile_get_version` | None | Bridge version |
| `mobile_list_devices` | None | List devices via mobile-mcp |
| `mobile_run_task` | Model B only | Natural-language UI automation |

Model A calls `mobile_run_task` once; Model B runs the full mobile-mcp loop.

---

## Architecture

```
IDE (Cursor / Kiro / …)          Model A — code, logs, decisions
        │  MCP: mobile_run_task
        ▼
mobile-bridge-mcp                3 high-level tools only
        │  spawn mobile-agent
        ▼
Cursor CLI (agent) + mobile-mcp  Model B — composer-2.5-fast
        │  adb / simctl
        ▼
Android / iOS device
```

---

## Quick start

### Prerequisites

- Node.js ≥ 20
- [Cursor CLI](https://cursor.com/docs/cli/overview): `curl https://cursor.com/install -fsS | bash && agent login`
- Android: `adb` ([platform-tools](https://developer.android.com/tools/releases/platform-tools))
- **Android physical device**: Developer options + USB debugging + **USB debugging (security settings)** — required for simulated taps. See [device requirements](./docs/en/device-requirements.md).

### Install (global)

```bash
git clone https://github.com/YOUR_ORG/mobile-automation.git
cd mobile-automation
bash scripts/install-global.sh
```

Installs to `~/.local/share/mobile-automation` and registers:

- `mobile-bridge-mcp` — MCP server
- `mobile-agent` — CLI
- `mobile-automation-update` — rebuild global install

### MCP config (user-level)

**Cursor** — `~/.cursor/mcp.json`:

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

**Kiro** — `~/.kiro/settings/mcp.json` (same block).

Restart MCP after saving. Template: [`config/mcp.json.example`](./config/mcp.json.example).

### Verify

```bash
mobile-agent version
mobile-agent devices --json
```

In Agent mode:

> Use mobile_list_devices, then mobile_run_task to open my app and tap the login button.

---

## CLI (without IDE)

```bash
mobile-agent run "Launch com.example.app and tap Sign in" --device DEVICE_ID --json
mobile-agent devices --json
mobile-automation-update
```

---

## Switch Model B

Set `MOBILE_MODEL_ID` in MCP `env` or shell:

```bash
export MOBILE_MODEL_ID="composer-2.5-fast"
agent --list-models   # see available IDs
```

Details: [docs/en/engines.md](./docs/en/engines.md)

---

## Documentation

| English | 中文 |
|---------|------|
| [Overview](./docs/en/README.md) | [概览](./docs/zh/README.md) |
| [Installation](./docs/en/installation.md) | [安装指南](./docs/zh/installation.md) |
| [Android device requirements](./docs/en/device-requirements.md) | [Android 真机注意事项](./docs/zh/device-requirements.md) |
| [Dual-model / engines](./docs/en/engines.md) | [双模型与切换引擎](./docs/zh/engines.md) |
| [IDE integrations](./docs/en/integrations.md) | [主流工具接入](./docs/zh/integrations.md) |
| [Troubleshooting](./docs/en/troubleshooting.md) | [故障排查](./docs/zh/troubleshooting.md) |

---

## License

MIT — see [LICENSE](./LICENSE).
