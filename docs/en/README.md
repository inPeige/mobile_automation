# mobile-automation Docs (English)

Dual-model, cost-efficient mobile UI automation bridge over [mobile-mcp](https://github.com/mobile-next/mobile-mcp).

[中文](../zh/README.md) · [Project README](../../README.md)

## Index

| Doc | Topics |
|-----|--------|
| [Installation](./installation.md) | Prerequisites, global install, verify |
| [**Android device requirements**](./device-requirements.md) | Developer mode, USB debugging, security settings |
| [Dual-model / engines](./engines.md) | Model A vs B, switch cheap model |
| [IDE integrations](./integrations.md) | Cursor, Kiro, Claude, CLI |
| [Troubleshooting](./troubleshooting.md) | MCP, INJECT_EVENTS, permissions |

## Architecture

```
IDE (Cursor / Kiro / …)            Model A — code, analysis
        │  MCP: mobile_run_task
        ▼
mobile-bridge-mcp                  3 high-level tools only
        │  spawn mobile-agent
        ▼
Cursor CLI (agent) + mobile-mcp    Model B — composer-2.5-fast
        │  adb / simctl
        ▼
Android / iOS device
```

## Paths

| Path | Purpose |
|------|---------|
| Cloned repo | Source, development |
| `~/.local/share/mobile-automation` | Global install |
| `~/.local/share/mobile-automation/agent-workspace` | Model B workspace |

## Quick start

```bash
git clone https://github.com/YOUR_ORG/mobile-automation.git
cd mobile-automation
bash scripts/install-global.sh

mobile-agent version
mobile-agent devices --json
```

## ⚠️ Android physical devices

Before **simulated taps** via MCP:

1. Developer mode
2. USB debugging
3. **USB debugging (security settings)** (required on Xiaomi / Redmi, etc.)

→ [Android device requirements](./device-requirements.md)

## Cost-saving rules

- List devices / version → `mobile_list_devices` / `mobile_get_version` (no LLM)
- UI flows → `mobile_run_task` (Model B only)
- Do **not** expose mobile-mcp low-level tools to Model A
