# mobile-automation 文档（中文）

基于 [mobile-mcp](https://github.com/mobile-next/mobile-mcp) 的双模型、省成本移动端 UI 自动化桥接。

[English](../en/README.md) · [项目 README（中文）](../../README.zh-CN.md)

## 文档目录

| 文档 | 内容 |
|------|------|
| [安装指南](./installation.md) | 前置依赖、全局安装、验证 |
| [**Android 真机注意事项**](./device-requirements.md) | **开发者模式、USB 调试、安全设置（模拟点击）** |
| [双模型与切换引擎](./engines.md) | Model A / Model B 分工、切换便宜模型 |
| [主流工具接入](./integrations.md) | Cursor、Kiro、Claude Code、CLI 等 |
| [故障排查](./troubleshooting.md) | 权限、MCP、真机、小米 INJECT_EVENTS |

## 架构

```
IDE（Cursor / Kiro / …）          Model A — 写代码、分析、决策
        │  MCP: mobile_run_task
        ▼
mobile-bridge-mcp                  仅 3 个高层 tool
        │  spawn mobile-agent
        ▼
Cursor CLI (agent) + mobile-mcp    Model B — composer-2.5-fast
        │  adb / simctl
        ▼
Android / iOS 设备
```

## 路径说明

| 路径 | 用途 |
|------|------|
| 克隆的仓库目录 | 源码（开发、改配置） |
| `~/.local/share/mobile-automation` | 全局安装运行目录 |
| `~/.local/share/mobile-automation/agent-workspace` | Model B 固定工作区 |

## 快速开始

```bash
git clone https://github.com/inPeige/mobile-automation.git
cd mobile-automation
bash scripts/install-global.sh

mobile-agent version
mobile-agent devices --json
```

## ⚠️ Android 真机必读

跑 **MCP 模拟点击** 前必须：

1. **开发者模式**
2. **USB 调试**
3. **USB 调试（安全设置）**（小米等必开）

👉 [Android 真机注意事项](./device-requirements.md)

## 省钱原则

- 列设备 / 查版本 → `mobile_list_devices` / `mobile_get_version`（无 LLM）
- 点屏幕、跑流程 → `mobile_run_task`（Model B）
- 禁止 IDE 直接调 `mobile_click` 等低层工具
