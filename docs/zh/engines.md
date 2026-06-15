# 双模型与切换引擎

[English](../en/engines.md)

## 为什么双模型

移动端自动化是重复机械操作。IDE 贵模型逐步调 `mobile_click` 极费 token。

| 角色 | 谁 | 典型模型 | 做什么 |
|------|-----|----------|--------|
| **Model A** | IDE 主对话 | Sonnet、Opus、GPT-4 等 | 写代码、分析、决策 |
| **Model B** | `mobile-agent` 内部 | `composer-2.5-fast` / DeepSeek / … | mobile-mcp 全流程 |

Model A 只能看到 3 个高层 MCP 工具。

## 调用链

```
Model A → mobile_run_task (1 次)
       → mobile-agent → 引擎 (Model B 循环)
       → summary 返回 Model A
```

零 LLM：`mobile_list_devices`、`mobile_get_version`

## 引擎

mobile-automation 支持两种 Model B 引擎后端：

| 引擎 | `MOBILE_ENGINE` | 需要 | 说明 |
|------|----------------|------|------|
| **Cursor CLI** | `cursor`（默认） | Cursor CLI `agent` 命令 | 使用 Cursor 自有模型 |
| **OpenAI 兼容接口** | `openai` | `OPENAI_API_KEY` | DeepSeek、GPT-4o、通义千问等 |

## 引擎：Cursor CLI（默认）

### 切换 Model B

```bash
export MOBILE_MODEL_ID="composer-2.5-fast"
```

或在 MCP `env` 中设置，然后重启 MCP。

### 查看模型

```bash
agent --list-models
```

| 模型 ID | 说明 |
|---------|------|
| `composer-2.5-fast` | 默认，快且便宜 |
| `composer-2.5` | 稍强 |
| `auto` | 自动选择 |

## 引擎：OpenAI 兼容接口

支持任何兼容 OpenAI Chat Completions API 且支持 function calling（工具调用）的模型。包括 **DeepSeek**、**GPT-4o**、**通义千问**、**GLM** 等。

### 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `MOBILE_ENGINE` | 是 | `cursor` | 设为 `openai` 启用此引擎 |
| `OPENAI_API_KEY` | 是 | — | API 密钥 |
| `OPENAI_MODEL_ID` | 否 | `deepseek-chat` | 模型 ID |
| `OPENAI_BASE_URL` | 否 | `https://api.deepseek.com/v1` | API 地址 |

### 示例：DeepSeek

```bash
export MOBILE_ENGINE=openai
export OPENAI_API_KEY=sk-your-deepseek-key
export OPENAI_MODEL_ID=deepseek-chat
export OPENAI_BASE_URL=https://api.deepseek.com/v1
```

MCP 配置（`~/.cursor/mcp.json` 或 `~/.kiro/settings/mcp.json`）：

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

### 示例：OpenAI GPT-4o

```bash
export MOBILE_ENGINE=openai
export OPENAI_API_KEY=sk-your-openai-key
export OPENAI_MODEL_ID=gpt-4o
export OPENAI_BASE_URL=https://api.openai.com/v1
```

### 示例：通义千问 (DashScope)

```bash
export MOBILE_ENGINE=openai
export OPENAI_API_KEY=sk-your-dashscope-key
export OPENAI_MODEL_ID=qwen-plus
export OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 工作原理

当 `MOBILE_ENGINE=openai` 时，mobile-agent 会：

1. 启动本地 mobile-mcp 进程并获取其工具列表
2. 将任务 prompt + 工具定义发送给 OpenAI 兼容模型
3. 执行模型返回的工具调用（tool_calls），传递给 mobile-mcp
4. 循环直到模型完成（stop）或达到最大迭代次数（30）
5. 返回摘要给 Model A

此模式**不需要安装 Cursor CLI**。

## Model A

由 IDE 选择，本仓库不配置。确保通过 **mobile-bridge** 调 `mobile_run_task`。

## 其他

- mobile-mcp 版本：改 `src/config.ts` 中 `MOBILE_MCP_SERVER`
- `MOBILE_AGENT_BIN`：指定 `agent` 路径（仅 cursor 引擎）

## 成本

| 方式 | Model A 次数 | Model B |
|------|----------------|---------|
| IDE 直连 mobile-mcp | N | 混用 A |
| **mobile-bridge (cursor)** | 1 | N（Cursor 便宜模型） |
| **mobile-bridge (openai)** | 1 | N（你选的 API） |
