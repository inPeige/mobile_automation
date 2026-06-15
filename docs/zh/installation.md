# 安装指南

[English](../en/installation.md)

## 前置依赖

### 必需

| 依赖 | 用途 | 安装 |
|------|------|------|
| **Node.js ≥ 20** | 编译与运行 bridge / agent | [nodejs.org](https://nodejs.org/) 或 `brew install node` |
| **Cursor CLI (`agent`)** | Model B 执行引擎 | `curl https://cursor.com/install -fsS \| bash` 然后 `agent login` |
| **Android Platform Tools** | Android 设备通信 | `brew install android-platform-tools`，确认 `adb devices` 可用 |

### Android 真机（跑 MCP 模拟点击必看）

> 完整说明：[Android 真机注意事项](./device-requirements.md)

在真机上执行 **点击、滑动、输入** 前，除 `adb` 外还必须：

| 步骤 | 说明 |
|------|------|
| 开发者模式 | 设置 → 关于手机 → 连点版本号 7 次 |
| USB 调试 | 开发者选项中开启，并授权本机 |
| **USB 调试（安全设置）** | **必须**——允许 adb 模拟触摸；小米需账号 + SIM，开启后 **重启手机** |

仅开 USB 调试时：列设备、截图可能正常，但 **所有模拟点击会失败**。

```bash
adb shell input tap 500 500   # 不应出现 SecurityException
```

### iOS（可选）

- Xcode + Command Line Tools
- 已启动 Simulator 或连接真机

### mobile-mcp 运行时

`npx @mobilenext/mobile-mcp@latest` 自动拉取，首次需联网。

---

## 全局安装

```bash
git clone https://github.com/inPeige/mobile-automation.git
cd mobile-automation
bash scripts/install-global.sh
```

1. 复制到 `~/.local/share/mobile-automation`
2. `npm install` + `npm run build`
3. `npm install -g .`

### 验证

```bash
mobile-agent version
mobile-agent devices --json
which mobile-bridge-mcp mobile-agent
```

### PATH

```bash
echo 'export PATH="'$(npm prefix -g)'/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## MCP 配置（用户级）

详见 [主流工具接入](./integrations.md)。

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

配置后 **重启 MCP**。

---

## 升级

```bash
cd mobile-automation && bash scripts/install-global.sh
# 或任意目录：
mobile-automation-update
```

---

## 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `MOBILE_MODEL_ID` | Model B 模型 ID | `composer-2.5-fast` |
| `MOBILE_AGENT_BIN` | `agent` 路径 | 自动探测 |
| `MOBILE_AGENT_WORKSPACE` | Model B 工作区 | `~/.local/share/mobile-automation/agent-workspace` |
| `MOBILEMCP_DISABLE_TELEMETRY` | 关闭 mobile-mcp 遥测 | 建议 `1` |
| `MOBILE_AUTOMATION_HOME` | 全局安装目录 | `~/.local/share/mobile-automation` |

---

## Skill（可选）

复制 `.cursor/skills/mobile-automation/` 到项目或用户 skill 目录。
