# Installation

[中文](../zh/installation.md)

## Prerequisites

### Required

| Dependency | Purpose | Install |
|------------|---------|---------|
| **Node.js ≥ 20** | Build and run bridge / agent | [nodejs.org](https://nodejs.org/) or `brew install node` |
| **Cursor CLI (`agent`)** | Model B runtime | `curl https://cursor.com/install -fsS \| bash` then `agent login` |
| **Android Platform Tools** | Device communication | `brew install android-platform-tools`; verify `adb devices` |

### Android physical device (simulated taps)

> Full guide: [Android device requirements](../en/device-requirements.md)

Before **tap / swipe / type** via `mobile_run_task`:

| Step | Description |
|------|-------------|
| Developer mode | Settings → About phone → tap Build number 7 times |
| USB debugging | Enable in Developer options; authorize this computer |
| **USB debugging (security settings)** | **Required** for adb-injected touches; on Xiaomi enable then **reboot** |

With USB debugging only: listing devices and screenshots may work, but **all simulated clicks fail**.

Self-test:

```bash
adb shell input tap 500 500   # must not throw SecurityException
```

### iOS (optional)

- Xcode + Command Line Tools
- Simulator running or device connected

### mobile-mcp runtime

Pulled automatically via `npx @mobilenext/mobile-mcp@latest`. Network required on first run.

---

## Global install

Works from **any workspace** after one-time install:

```bash
git clone https://github.com/YOUR_ORG/mobile-automation.git
cd mobile-automation
bash scripts/install-global.sh
```

This copies to `~/.local/share/mobile-automation`, runs `npm install` + `npm run build`, and `npm install -g .`.

### Verify

```bash
mobile-agent version
mobile-agent devices --json
which mobile-bridge-mcp mobile-agent
```

### PATH issues

```bash
echo 'export PATH="'$(npm prefix -g)'/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## MCP setup (user-level)

Register in **user-level** IDE config (not project `.cursor/mcp.json`). See [integrations](./integrations.md).

Minimal config:

```json
{
  "mcpServers": {
    "mobile-bridge": {
      "command": "mobile-bridge-mcp",
      "env": {
        "MOBILEMCP_DISABLE_TELEMETRY": "1"
      }
    }
  }
}
```

**Restart MCP** after saving.

---

## Upgrade

After editing the cloned repo:

```bash
cd mobile-automation
bash scripts/install-global.sh
```

From any directory:

```bash
mobile-automation-update
```

Restart IDE MCP after upgrade.

---

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MOBILE_MODEL_ID` | Model B Cursor model ID | `composer-2.5-fast` |
| `MOBILE_AGENT_BIN` | Path to `agent` binary | Auto-detect |
| `MOBILE_AGENT_WORKSPACE` | Model B workspace | `~/.local/share/mobile-automation/agent-workspace` |
| `MOBILEMCP_DISABLE_TELEMETRY` | Disable mobile-mcp telemetry | Set to `1` |
| `MOBILE_AUTOMATION_HOME` | Global install dir | `~/.local/share/mobile-automation` |

Example MCP env:

```json
"env": {
  "MOBILEMCP_DISABLE_TELEMETRY": "1",
  "MOBILE_MODEL_ID": "composer-2.5-fast"
}
```

---

## Cursor Skill (optional)

Copy `.cursor/skills/mobile-automation/` into your project or user skills folder so Model A uses the bridge only.
