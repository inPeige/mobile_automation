# 故障排查

[English](../en/troubleshooting.md)

## MCP

- **红点 / 连接失败**：`which mobile-bridge-mcp` → `mobile-agent version` → 重启 MCP → 看 Output 日志
- **旧版本**：`mobile-automation-update` 或 `bash scripts/install-global.sh` → 重启 MCP
- **Workspace Trust**：升级到 ≥ v1.0.5，含 `--trust --force --approve-mcps`

## Cursor CLI

```bash
curl https://cursor.com/install -fsS | bash
agent login
export MOBILE_AGENT_BIN="$HOME/.cursor/bin/agent"
```

## 设备

- `adb devices` 空 → 线材、授权、模拟器、`adb kill-server && adb start-server`
- 无设备 → 先修 adb，再测 `npx @mobilenext/mobile-mcp@latest`

## 小米 / 红米：INJECT_EVENTS

> [Android 真机注意事项](./device-requirements.md)

```
SecurityException: Injecting input events requires INJECT_EVENTS permission
```

1. USB 调试 + **USB 调试（安全设置）**
2. **重启手机**
3. `adb shell input tap 500 500`
4. 再跑 `mobile_run_task`

仅 USB 调试：能读界面，**不能点击**。

## 任务

- `success: true` 但 summary 说失败 → 以 summary 为准
- 超时 → 增大 `timeout_sec` 或拆任务
- 弹窗 → instruction 写明关闭弹窗

## 工作区

```
~/.local/share/mobile-automation/agent-workspace/
├── .cursor/mcp.json
└── screenshots/
```

## 检查命令

```bash
mobile-agent version
mobile-agent devices --json
adb devices
npm list -g @realsee/mobile-automation
```

## 链接

- [mobile-mcp](https://github.com/mobile-next/mobile-mcp)
- [Cursor CLI parameters](https://cursor.com/docs/cli/reference/parameters)
