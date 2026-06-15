---
name: mobile-automation
description: 在 Android/iOS 真机或模拟器上执行 UI 自动化测试。当用户提到真机测试、模拟器操作、mobile-mcp、移动端回归、App UI 验证时使用。必须使用 mobile-bridge MCP 或 mobile-agent CLI，禁止直接调用 mobile-mcp 低层工具。
---

# 移动端 UI 自动化（独立全局工具）

完整文档见 **[docs/zh/README.md](../../../docs/zh/README.md)**（中文）· **[docs/en/README.md](../../../docs/en/README.md)**（English）。

源码目录：`~/Desktop/mobile-automation`  
运行目录：`~/.local/share/mobile-automation`（全局安装，不依赖任何 App 项目）

## 命令（任意 cwd）

```bash
mobile-agent version
mobile-agent devices --json
mobile-agent run "任务描述" --json
mobile-automation-update
```

## MCP（Cursor / Kiro 用户级配置）

```json
{
  "mcpServers": {
    "mobile-bridge": {
      "command": "mobile-bridge-mcp",
      "env": { "MOBILEMCP_DISABLE_TELEMETRY": "1" }
    }
  }
}
```

工具：`mobile_get_version`、`mobile_list_devices`、`mobile_run_task`

## 开发 / 发版

```bash
cd ~/Desktop/mobile-automation
bash scripts/install-global.sh   # 同步到 ~/.local/share 并注册全局命令
```

## 必须遵守

- **Android 真机**：开发者模式 + USB 调试 + **USB 调试（安全设置）** 全开，否则 MCP 无法模拟点击（见 [wiki/device-requirements.md](../../../wiki/device-requirements.md)）
- **禁止** IDE 直接调用 mobile-mcp 低层工具
- 列设备 / 查版本 → bridge 工具（无 LLM）
- 跑 UI → `mobile_run_task`（Composer 2.5 Fast）
