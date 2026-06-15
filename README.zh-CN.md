# mobile-automation

**面向 AI IDE 的省钱型移动端 UI 自动化** — 基于 [mobile-mcp](https://github.com/mobile-next/mobile-mcp) 的双模型 MCP 桥接。

**Model A**（IDE 主模型）负责写代码和分析；**Model B**（默认 `composer-2.5-fast`）通过一次高层 MCP 调用完成点按、滑动和完整 UI 流程。

[English](./README.md) · [完整文档 (中文)](./docs/zh/README.md) · [Full docs (EN)](./docs/en/README.md)

---

## 为什么需要它

IDE 直连 mobile-mcp 时，**贵模型**会为每一次点击做决策，一个任务可能产生几十次 tool call。

**mobile-automation** 只暴露 3 个 MCP 工具：

| 工具 | LLM 成本 | 用途 |
|------|----------|------|
| `mobile_get_version` | 无 | 查看 bridge 版本 |
| `mobile_list_devices` | 无 | 列出设备 |
| `mobile_run_task` | 仅 Model B | 自然语言 UI 自动化 |

Model A 只调一次 `mobile_run_task`；Model B 在内部跑完 mobile-mcp 循环。

---

## 架构

```
IDE（Cursor / Kiro / …）           Model A — 写代码、分析、决策
        │  MCP: mobile_run_task
        ▼
mobile-bridge-mcp                  仅 3 个高层 tool
        │  spawn mobile-agent
        ▼
┌──────────────────────────────────────────┐
│ 引擎: cursor（默认）                       │
│   Cursor CLI (agent) + mobile-mcp        │
│   Model B — composer-2.5-fast            │
├──────────────────────────────────────────┤
│ 引擎: openai                             │
│   OpenAI 兼容 API + mobile-mcp            │
│   Model B — DeepSeek / GPT-4o / 通义千问 … │
└──────────────────────────────────────────┘
        │  adb / simctl
        ▼
Android / iOS 设备
```

---

## 快速开始

### 前置依赖

- Node.js ≥ 20
- [Cursor CLI](https://cursor.com/docs/cli/overview)：`curl https://cursor.com/install -fsS | bash && agent login`
- Android：`adb`（[platform-tools](https://developer.android.com/tools/releases/platform-tools)）
- **Android 真机**：开发者模式 + USB 调试 + **USB 调试（安全设置）** — 模拟点击必须。见 [真机注意事项](./docs/zh/device-requirements.md)。

### 安装（全局）

```bash
git clone https://github.com/inPeige/mobile-automation.git
cd mobile-automation
bash scripts/install-global.sh
```

安装到 `~/.local/share/mobile-automation`，并注册：

- `mobile-bridge-mcp` — MCP 服务
- `mobile-agent` — CLI
- `mobile-automation-update` — 重新编译全局安装

### MCP 配置（用户级）

**Cursor** — `~/.cursor/mcp.json`：

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

**Kiro** — `~/.kiro/settings/mcp.json`（同上）。

保存后 **重启 MCP**。模板：[`config/mcp.json.example`](./config/mcp.json.example)。

### 验证

```bash
mobile-agent version
mobile-agent devices --json
```

在 Agent 模式：

> 用 mobile_list_devices 列出设备，再用 mobile_run_task 打开 App 并点击登录。

---

## CLI（不经过 IDE）

```bash
mobile-agent run "启动 com.example.app 并点击登录" --device DEVICE_ID --json
mobile-agent devices --json
mobile-automation-update
```

---

## 切换 Model B

在 MCP 的 `env` 或 shell 中设置 `MOBILE_MODEL_ID`：

```bash
export MOBILE_MODEL_ID="composer-2.5-fast"
agent --list-models
```

### 使用 OpenAI 兼容模型（DeepSeek、GPT-4o、通义千问等）

设置 `MOBILE_ENGINE=openai` 并提供 API 密钥。**无需安装 Cursor CLI。**

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

详见 [docs/zh/engines.md](./docs/zh/engines.md)。

---

## 文档

| 中文 | English |
|------|---------|
| [概览](./docs/zh/README.md) | [Overview](./docs/en/README.md) |
| [安装指南](./docs/zh/installation.md) | [Installation](./docs/en/installation.md) |
| [Android 真机注意事项](./docs/zh/device-requirements.md) | [Android device requirements](./docs/en/device-requirements.md) |
| [双模型与切换引擎](./docs/zh/engines.md) | [Dual-model / engines](./docs/en/engines.md) |
| [主流工具接入](./docs/zh/integrations.md) | [IDE integrations](./docs/en/integrations.md) |
| [故障排查](./docs/zh/troubleshooting.md) | [Troubleshooting](./docs/en/troubleshooting.md) |

---

## 许可证

MIT — 见 [LICENSE](./LICENSE)。
