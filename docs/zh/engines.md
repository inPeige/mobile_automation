# 双模型与切换引擎

[English](../en/engines.md)

## 为什么双模型

移动端自动化是重复机械操作。IDE 贵模型逐步调 `mobile_click` 极费 token。

| 角色 | 谁 | 典型模型 | 做什么 |
|------|-----|----------|--------|
| **Model A** | IDE 主对话 | Sonnet、Opus、GPT-4 等 | 写代码、分析、决策 |
| **Model B** | `mobile-agent` 内部 | `composer-2.5-fast` | mobile-mcp 全流程 |

Model A 只能看到 3 个高层 MCP 工具。

## 调用链

```
Model A → mobile_run_task (1 次)
       → mobile-agent → agent + mobile-mcp (Model B 循环)
       → summary 返回 Model A
```

零 LLM：`mobile_list_devices`、`mobile_get_version`

## 切换 Model B

### 环境变量（推荐）

```bash
export MOBILE_MODEL_ID="composer-2.5-fast"
```

或在 MCP `env` 中设置，然后重启 MCP。

### 改源码

编辑 `src/config.ts` 默认值，再 `bash scripts/install-global.sh`。

### 查看模型

```bash
agent --list-models
```

| 模型 ID | 说明 |
|---------|------|
| `composer-2.5-fast` | 默认，快且便宜 |
| `composer-2.5` | 稍强 |
| `auto` | 自动选择 |

## Model A

由 IDE 选择，本仓库不配置。确保通过 **mobile-bridge** 调 `mobile_run_task`。

## 其他

- mobile-mcp 版本：改 `src/config.ts` 中 `MOBILE_MCP_SERVER`
- `MOBILE_AGENT_BIN`：指定 `agent` 路径

## 成本

| 方式 | Model A 次数 | Model B |
|------|----------------|---------|
| IDE 直连 mobile-mcp | N | 混用 A |
| **mobile-bridge** | 1 | N（全便宜模型） |
