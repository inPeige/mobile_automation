# 安装指南

## 前置依赖

### 必需

| 依赖 | 用途 | 安装 |
|------|------|------|
| **Node.js ≥ 20** | 编译与运行 bridge / agent | [nodejs.org](https://nodejs.org/) 或 `brew install node` |
| **Cursor CLI (`agent`)** | Model B 执行引擎 | `curl https://cursor.com/install -fsS \| bash` 然后 `agent login` |
| **Android Platform Tools** | Android 设备通信 | `brew install android-platform-tools`，确认 `adb devices` 可用 |

### Android 真机（跑 MCP 模拟点击必看）

> 完整说明：[Android 真机注意事项](./device-requirements.md)

在真机上执行 **点击、滑动、输入**（即 `mobile_run_task` 典型流程）前，除 `adb` 外还必须：

| 步骤 | 说明 |
|------|------|
| 开发者模式 | 设置 → 关于手机 → 连点版本号 7 次 |
| USB 调试 | 开发者选项中开启，并授权本机 |
| **USB 调试（安全设置）** | **必须**——允许 adb 模拟触摸；小米需账号 + SIM，开启后 **重启手机** |

仅开 USB 调试时：`mobile_list_devices`、截图可能正常，但 **所有模拟点击会失败**。

自测：

```bash
adb shell input tap 500 500   # 不应出现 SecurityException
```

### iOS（可选）

- Xcode + Command Line Tools
- 已启动 Simulator 或连接真机

### mobile-mcp 运行时

`mobile-mcp` 通过 `npx @mobilenext/mobile-mcp@latest` 自动拉取，无需单独安装。首次调用需联网。

---

## 全局安装

本工具**不依赖任何 App 项目**，安装一次后任意工作区可用。

```bash
cd ~/Desktop/mobile-automation
bash scripts/install-global.sh
```

脚本会：

1. 复制源码到 `~/.local/share/mobile-automation`
2. `npm install` + `npm run build`
3. `npm install -g .` 注册全局命令

### 安装后验证

```bash
mobile-agent version
# @realsee/mobile-automation v1.0.x

mobile-agent devices --json
# 应返回已连接设备列表

which mobile-bridge-mcp mobile-agent
# 应在 PATH 中（通常在 $(npm prefix -g)/bin）
```

### PATH 问题

若提示 `command not found`：

```bash
echo 'export PATH="'$(npm prefix -g)'/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## 配置 MCP（用户级）

安装 CLI 后，还需在 **IDE 用户级配置** 中注册 MCP（不是项目内 `.cursor/mcp.json`）。

详见 [主流工具接入](./integrations.md)。

最小配置：

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

配置完成后 **重启 MCP**（Reload Window 或 MCP 设置页刷新）。

---

## 升级

### 改了 Desktop 源码后

```bash
cd ~/Desktop/mobile-automation
bash scripts/install-global.sh
```

### 仅重新编译全局目录（任意 cwd）

```bash
mobile-automation-update
```

升级后重启 Cursor / Kiro 的 MCP 连接。

---

## 可选环境变量

可在 MCP 配置的 `env` 块或 shell 中设置：

| 变量 | 说明 | 默认 |
|------|------|------|
| `MOBILE_MODEL_ID` | Model B 使用的 Cursor 模型 ID | `composer-2.5-fast` |
| `MOBILE_AGENT_BIN` | `agent` 可执行文件路径 | 自动探测 |
| `MOBILE_AGENT_WORKSPACE` | Model B 工作区目录 | `~/.local/share/mobile-automation/agent-workspace` |
| `MOBILEMCP_DISABLE_TELEMETRY` | 关闭 mobile-mcp 遥测 | 建议设为 `1` |
| `MOBILE_AUTOMATION_HOME` | 全局安装目录 | `~/.local/share/mobile-automation` |

示例（在 MCP 里切换 Model B 模型）：

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

---

## Skill（可选）

仓库内附带 Cursor Skill：`.cursor/skills/mobile-automation/SKILL.md`。

可将该目录复制到任意项目的 `.cursor/skills/`，或放到用户级 skill 目录，用于约束 Model A **只调 bridge、不碰低层 mobile 工具**。

若 IDE 支持从 Desktop 打开 workspace，也可直接在 `~/Desktop/mobile-automation` 打开项目以加载 Skill。
