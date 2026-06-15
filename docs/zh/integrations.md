# 主流工具接入

[English](../en/integrations.md)

> **Android 真机**：须开开发者模式、USB 调试、**USB 调试（安全设置）**。见 [device-requirements.md](./device-requirements.md)。

## Cursor

`~/.cursor/mcp.json`：

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

保存 → MCP 绿点 / Reload Window → Agent 模式使用。

## Kiro

`~/.kiro/settings/mcp.json` — 同上。

## Claude Desktop / Claude Code

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```bash
claude mcp add mobile-bridge -- mobile-bridge-mcp
```

## Windsurf / Cline / Continue

command: `mobile-bridge-mcp`，env 见 `config/mcp.json.example`。

## MCP 工具

| 工具 | 说明 |
|------|------|
| `mobile_get_version` | 版本 |
| `mobile_list_devices` | 列设备（无 LLM） |
| `mobile_run_task` | UI 任务（Model B） |

```json
{
  "instruction": "启动 com.example.app，点击登录",
  "device": "emulator-5554",
  "timeout_sec": 300
}
```

## CLI

```bash
mobile-agent devices --json
mobile-agent run "任务描述" --device ID --timeout 600 --json
```

## 典型工作流

1. Model A 改代码  
2. 安装到设备  
3. 「用 mobile_run_task 验证 xxx 流程」  
4. Model B 操作并返回 summary  
5. Model A 继续改代码  

**不要** IDE 直连 mobile-mcp 低层工具。
