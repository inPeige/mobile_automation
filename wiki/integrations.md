# 主流工具接入

所有 IDE 共用同一套全局命令 `mobile-bridge-mcp`，配置写在 **用户级** MCP 文件即可，与打开哪个项目无关。

> **Android 真机**：跑 `mobile_run_task` 前须开开发者模式、USB 调试、**USB 调试（安全设置）**，否则无法模拟点击。见 [device-requirements.md](./device-requirements.md)。

---

## Cursor

### 配置文件

`~/.cursor/mcp.json`

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

若已有其他 MCP（如 Figma），在同一 `mcpServers` 对象里追加 `mobile-bridge` 即可。

### 启用步骤

1. 保存 `mcp.json`
2. `Cmd + ,` → **MCP** → 确认 `mobile-bridge` 绿点
3. 或 `Cmd+Shift+P` → **Developer: Reload Window**

### 使用方式

在 **Agent 模式** 中自然语言描述任务，例如：

> 用 mobile_list_devices 看有哪些设备，然后用 mobile_run_task 在如视VR 上切换到手机拍并开始采集

### 可用 MCP 工具

| 工具 | 说明 |
|------|------|
| `mobile_get_version` | 查看 bridge 版本 |
| `mobile_list_devices` | 列出设备（无 LLM） |
| `mobile_run_task` | 执行自然语言 UI 任务（Model B） |

`mobile_run_task` 参数：

```json
{
  "instruction": "启动 com.example.app，点击登录",
  "device": "emulator-5554",
  "timeout_sec": 300
}
```

### Skill（推荐）

复制 `.cursor/skills/mobile-automation/` 到你的项目或用户 skill 目录，避免 Model A 误用低层 mobile 工具。

---

## Kiro

### 配置文件

`~/.kiro/settings/mcp.json`（或在 Kiro MCP 设置 UI 中填写）

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

保存后重启 Kiro MCP。用法与 Cursor 相同。

---

## Claude Desktop / Claude Code

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）

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

### Claude Code CLI

```bash
claude mcp add mobile-bridge -- mobile-bridge-mcp
```

---

## Windsurf

Windsurf MCP 设置中添加 **command** 类型：

```
mobile-bridge-mcp
```

或在配置 JSON 的 `mcpServers` 中加入与 Cursor 相同的块。

---

## Cline / Continue / 其他 MCP 客户端

通用 stdio 配置：

| 字段 | 值 |
|------|-----|
| type | command / stdio |
| command | `mobile-bridge-mcp` |
| args | （留空） |
| env | `MOBILEMCP_DISABLE_TELEMETRY=1` |

参考模板：`config/mcp.json.example`

---

## 终端 CLI（不经过 IDE）

任意目录直接调用 Model B：

```bash
# 列设备
mobile-agent devices --json

# 跑任务
mobile-agent run "启动 com.realsee.dimensionplus，点击开始采集" \
  --device 19a44e01 \
  --timeout 600 \
  --json

# 查版本
mobile-agent version
```

适合 CI、脚本、或 IDE MCP 未加载时的手动调试。

---

## 与 Cursor CLI (`agent`) 的关系

| 入口 | 场景 |
|------|------|
| IDE + mobile-bridge MCP | 日常：A 写代码，一句话调 B 测手机 |
| `mobile-agent run` | 脚本 / 终端 / MCP 故障时手动跑 |
| `agent -p "..."` 直连 mobile-mcp | **不推荐**，A 会逐步点屏幕，费钱 |

Model B 依赖 `agent login` 登录状态；headless 需本工具已处理的 `--trust --force --approve-mcps` 参数。

---

## 典型工作流（capture 类 App）

1. **Model A** 在 IDE 里改 Kotlin / Flutter 代码  
2. 编译安装到设备（Gradle / Android Studio）  
3. 对 IDE 说：「用 mobile_run_task 验证手动对齐流程」  
4. **Model B** 在设备上操作并返回 summary  
5. **Model A** 根据结果继续改代码  

instruction 示例：

```
在 Android 设备上：
1. 启动 com.realsee.dimensionplus
2. 关闭所有弹窗
3. 左侧切换到「手机拍」
4. 点击「开始采集」
5. 按指引完成 1 个点位
6. 截图并汇报最终界面
```
