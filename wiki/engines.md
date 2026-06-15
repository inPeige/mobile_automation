# 双模型与切换引擎

## 为什么双模型

移动端自动化是 **重复、机械** 的操作（看屏幕 → 点按钮 → 等加载 → 再点）。用 IDE 里的贵模型逐步调 `mobile_click` 会极费 token。

本工具采用 **双模型分工**：

| 角色 | 谁 | 典型模型 | 做什么 |
|------|-----|----------|--------|
| **Model A** | Cursor / Kiro 对话里的主模型 | Sonnet、Opus、GPT-4 等 | 写代码、读 log、分析结果、决定下一步 |
| **Model B** | `mobile-agent` 内部 | `composer-2.5-fast`（默认） | 执行 mobile-mcp 全流程（点、滑、输入、截图） |

Model A **只能看到 3 个高层 MCP 工具**，看不到 `mobile_click` 等低层 API，从架构上避免误用贵模型点屏幕。

---

## 调用链

```
你：「帮我在真机上跑一遍采集流程」
        ↓
Model A 调用 mobile_run_task({ instruction: "..." })   ← 1 次 MCP 调用
        ↓
mobile-bridge  spawn → mobile-agent run "..."
        ↓
Cursor CLI: agent --trust --force --approve-mcps -p "..." --model composer-2.5-fast
        ↓
Model B 循环调用 mobile-mcp 工具（list_elements、click、screenshot…）
        ↓
返回 JSON summary 给 Model A
```

**零 LLM 成本** 的操作：

- `mobile_list_devices` — 直连 mobile-mcp，不经过 agent
- `mobile_get_version` — 只读 package 版本

---

## 切换 Model B（便宜引擎）

Model B 通过 **Cursor CLI** 的 `--model` 参数指定，默认 `composer-2.5-fast`。

### 方式 1：环境变量（推荐，无需改代码）

在 MCP 配置或终端 export：

```bash
export MOBILE_MODEL_ID="composer-2.5-fast"
```

或在 `~/.cursor/mcp.json` / Kiro MCP 的 `env` 中：

```json
"env": {
  "MOBILE_MODEL_ID": "composer-2.5-fast",
  "MOBILEMCP_DISABLE_TELEMETRY": "1"
}
```

修改后 **重启 MCP**。

### 方式 2：改源码默认值

编辑 `src/config.ts`：

```typescript
export const MOBILE_MODEL_ID =
  process.env.MOBILE_MODEL_ID?.trim() || "composer-2.5-fast";
```

将默认值改为其他 Cursor 支持的模型 ID，然后：

```bash
bash scripts/install-global.sh
```

### 查看可用模型

```bash
agent --list-models
```

常用便宜模型（以你账号实际列表为准）：

| 模型 ID | 说明 |
|---------|------|
| `composer-2.5-fast` | 默认，速度快、成本低 |
| `composer-2.5` | 稍强，仍比 Opus 便宜 |
| `auto` | 由 Cursor 自动选择 |

> Model B 必须是你 Cursor 订阅/API 可用的模型 ID。

---

## Model A 怎么选

Model A **不需要在本仓库配置**，由你使用的 IDE 决定：

- **Cursor**：Chat / Agent 里选的模型
- **Kiro**：Kiro 当前对话模型
- **Claude Code / 其他**：各自默认模型

只需保证 Model A 通过 **mobile-bridge MCP** 调 `mobile_run_task`，而不是直接连 mobile-mcp。

---

## 切换 mobile-mcp 本身

底层设备控制由 [mobile-mcp](https://github.com/mobile-next/mobile-mcp) 提供，默认：

```typescript
npx -y @mobilenext/mobile-mcp@latest
```

如需固定版本，改 `src/config.ts` 中 `MOBILE_MCP_SERVER.args`，重新 `install-global.sh`。

---

## 指定 agent 二进制路径

若 `agent` 不在 PATH：

```bash
export MOBILE_AGENT_BIN="$HOME/.cursor/bin/agent"
```

或在 MCP `env` 中设置 `MOBILE_AGENT_BIN`。

---

## 成本对比（直觉）

| 方式 | Model A 调用次数 | Model B 调用 |
|------|------------------|--------------|
| IDE 直连 mobile-mcp | N 次（每步 tool call） | 无 / 混用 A |
| **mobile-bridge（本工具）** | 1 次 `mobile_run_task` | N 次（全是便宜模型） |

任务越复杂、步骤越多，bridge 方案省得越多。
