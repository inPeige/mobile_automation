# 故障排查

## MCP 相关

### mobile-bridge 红点 / 连接失败

1. 确认已全局安装：`which mobile-bridge-mcp`
2. 确认已编译：`mobile-agent version`
3. 重启 MCP 或 Reload Window
4. 查看 Cursor **Output → MCP** 日志

### MCP 仍是旧版本

`mobile_get_version` 返回旧版本时：

```bash
mobile-automation-update
# 或
cd ~/Desktop/mobile-automation && bash scripts/install-global.sh
```

然后重启 MCP（MCP 进程会缓存旧代码，必须重启）。

### Workspace Trust Required

**现象**：`mobile_run_task` 报错要求 trust workspace。

**原因**：旧版 `mobile-agent` 使用临时目录且未传 `--trust`。

**解决**：升级到 ≥ v1.0.5，使用固定工作区 `agent-workspace` 并带 `--trust --force --approve-mcps`。执行 `mobile-automation-update` 后重启 MCP。

---

## Cursor CLI / Model B

### agent: command not found

```bash
curl https://cursor.com/install -fsS | bash
agent login
export MOBILE_AGENT_BIN="$HOME/.cursor/bin/agent"  # 如仍找不到
```

### agent 未登录 / 401

```bash
agent login
```

确认 `CURSOR_API_KEY` 或 CLI 登录状态有效。

---

## 设备相关

### adb devices 为空

- 检查 USB 线、授权弹窗（允许 USB 调试）
- 模拟器是否已启动
- `adb kill-server && adb start-server`

### mobile_list_devices 无设备

- 先确认 `adb devices` 正常
- 确认 `npx @mobilenext/mobile-mcp@latest` 能手动运行（需 Node 22+ 更佳）

---

## 小米 / 红米真机：INJECT_EVENTS

> 完整真机配置见 **[Android 真机注意事项](./device-requirements.md)**

**现象**：

```
SecurityException: Injecting input events requires INJECT_EVENTS permission
```

**原因**：MIUI / HyperOS 默认禁止 adb 模拟点击；mobile-mcp 的 `mobile_click`、`mobile_swipe` 等均依赖 **INJECT_EVENTS** 权限，需开启 **USB 调试（安全设置）**。

**解决**：

1. **设置 → 更多设置 → 开发者选项**
2. 开启 **USB 调试**
3. 开启 **USB 调试（安全设置）**（需小米账号 + SIM，按提示确认约 3 次）
4. **重启手机** 后重新连接 USB
5. 自测：`adb shell input tap 500 500` 不应报错
6. 再跑 `mobile_run_task` 或 `mobile-agent run ...`

> **仅 USB 调试、未开安全设置**：设备在线、能截图读界面，但 **MCP 无法模拟点击**，自动化必失败。

> **建议**：UI 自动化开发优先用 **Android 模拟器**，一般无此限制。

---

## 任务结果

### success: true 但实际未完成

Model B 的 agent 可能把「尽力执行」判为 finished。以 `summary` 正文为准，不要只看 `success` 字段。

### 任务超时

增大 `timeout_sec`（默认 300），或把 instruction 拆成更小步骤多次调用 `mobile_run_task`。

### 弹窗阻塞

在 instruction 里明确写：「关闭所有弹窗（发现设备、权限、网络提示等）」。

---

## 日志与截图

Model B 工作区：

```
~/.local/share/mobile-automation/agent-workspace/
├── .cursor/mcp.json      # mobile-mcp 配置
└── screenshots/          # agent 可能保存的截图（若 instruction 要求）
```

MCP 日志：Cursor → Output → 选择 MCP 相关 channel。

---

## 常用检查命令

```bash
mobile-agent version
mobile-agent devices --json
agent --version
agent login status    # 视 CLI 版本而定
adb devices
npm list -g @realsee/mobile-automation
```

---

## 获取帮助

- mobile-mcp 官方：[github.com/mobile-next/mobile-mcp](https://github.com/mobile-next/mobile-mcp)
- Cursor CLI 参数：[cursor.com/docs/cli/reference/parameters](https://cursor.com/docs/cli/reference/parameters)
