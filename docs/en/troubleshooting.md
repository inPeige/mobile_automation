# Troubleshooting

[中文](../zh/troubleshooting.md)

## MCP

- **Red dot / connection failed**: `which mobile-bridge-mcp` → `mobile-agent version` → restart MCP → check Output logs
- **Stale version**: `mobile-automation-update` or re-run `install-global.sh` → restart MCP
- **Workspace Trust**: upgrade to ≥ v1.0.5 with `--trust --force --approve-mcps`

## Cursor CLI

```bash
curl https://cursor.com/install -fsS | bash
agent login
export MOBILE_AGENT_BIN="$HOME/.cursor/bin/agent"
```

## Devices

- Empty `adb devices` → cable, authorize USB debugging, start emulator, `adb kill-server && adb start-server`
- No devices in bridge → fix adb first; test `npx @mobilenext/mobile-mcp@latest`

## Xiaomi / Redmi: INJECT_EVENTS

> [Android device requirements](./device-requirements.md)

```
SecurityException: Injecting input events requires INJECT_EVENTS permission
```

1. USB debugging + **USB debugging (security settings)**
2. **Reboot phone**
3. `adb shell input tap 500 500`
4. Retry `mobile_run_task`

USB debugging alone: UI tree/screenshots may work; **taps fail**.

## Tasks

- `success: true` but summary says incomplete → trust `summary`
- Timeout → increase `timeout_sec` or split tasks
- Popups → instruct “close all dialogs” in `instruction`

## Workspace

```
~/.local/share/mobile-automation/agent-workspace/
├── .cursor/mcp.json
└── screenshots/
```

## Quick checks

```bash
mobile-agent version
mobile-agent devices --json
adb devices
npm list -g @realsee/mobile-automation
```

## Links

- [mobile-mcp](https://github.com/mobile-next/mobile-mcp)
- [Cursor CLI parameters](https://cursor.com/docs/cli/reference/parameters)
