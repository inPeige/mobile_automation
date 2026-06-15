# Android 真机注意事项

[English](../en/device-requirements.md)

在 **Android 真机** 上跑 `mobile_run_task` 的点击、滑动、输入时，必须满足本节。**仅 `adb devices` 能连上还不够**。

> **Android 模拟器** 一般无此限制。  
> **iOS** 见文末。

---

## 必须开启

### 1. 开发者模式

设置 → 关于手机 → 连点 **版本号** 7 次 → 开发者选项

### 2. USB 调试

开启后连接电脑，授权「允许 USB 调试」。

```bash
adb devices   # 应显示 device
```

### 3. USB 调试（安全设置）——模拟点击关键

允许 adb **注入触摸/按键**。mobile-mcp 的 `mobile_click`、`mobile_swipe` 等依赖此项。

| 品牌 | 名称 / 路径 |
|------|-------------|
| **小米 / 红米** | **USB 调试（安全设置）**（需小米账号 + SIM，确认约 3 次，**重启手机**） |
| **华为 / 荣耀** | 仅充电模式下允许 ADB 调试等 |
| **OPPO / 一加 / realme** | USB 调试（安全设置） |
| **vivo / iQOO** | USB 调试（安全设置） |
| **三星 / Pixel** | 通常 USB 调试即可；失败再查 OEM 项 |

自测：

```bash
adb shell input tap 500 500
```

若 `SecurityException` / `INJECT_EVENTS` → 安全设置未生效。

---

## 与 MCP 模拟点击

| 能力 | 仅 USB 调试 | + 安全设置 |
|------|-------------|------------|
| `adb devices` / 列设备 | ✅ | ✅ |
| 截图 / 读界面 | ✅ 通常 | ✅ |
| **点击 / 滑动 / 输入** | ❌ | ✅ |
| **`mobile_run_task` 完整流程** | ❌ | ✅ |

---

## 自检清单

- [ ] 开发者模式
- [ ] USB 调试 + 电脑授权
- [ ] **USB 调试（安全设置）**
- [ ] 改设置后 **重启手机**（小米建议必做）
- [ ] `adb shell input tap 500 500` 无报错
- [ ] `mobile-agent devices --json` 可见设备

---

## 其他提示

- 保持屏幕常亮；USB 模式选 **文件传输 / MTP**
- MIUI 对目标 App 关闭省电限制
- instruction 写明「关闭所有弹窗」

---

## iOS

- **Simulator**：Xcode 启动即可
- **真机**：Xcode + 签名；见 [mobile-mcp Wiki](https://github.com/mobile-next/mobile-mcp/wiki)

---

失败时见 [故障排查](./troubleshooting.md#小米--红米真机inject_events)。
