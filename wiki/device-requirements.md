# Android 真机注意事项

在 **Android 真机** 上跑 `mobile_run_task` / mobile-mcp 的点击、滑动、输入等操作时，必须满足本节条件。**仅 `adb devices` 能连上还不够**——没有「模拟点击」权限时，自动化会在第一步点击就失败。

> **Android 模拟器** 一般无此限制，适合日常开发调试。  
> **iOS 真机 / 模拟器** 要求见文末简要说明。

---

## 必须开启的选项

### 1. 开发者模式

1. **设置 → 关于手机**
2. 连续点击 **版本号** 7 次，直到提示「您已处于开发者模式」
3. 返回 **设置 → 更多设置 → 开发者选项**（各品牌路径略有不同）

### 2. USB 调试

在 **开发者选项** 中打开：

- **USB 调试**（必须）

连接电脑时，手机弹出「允许 USB 调试？」→ 勾选「始终允许」→ **允许**。

验证：

```bash
adb devices
# 应显示 device（不是 unauthorized / offline）
```

### 3. USB 调试（安全设置）——模拟点击的关键

在 **开发者选项** 中打开：

- **USB 调试（安全设置）**（名称因品牌而异，见下表）

此项允许电脑通过 adb **注入触摸/按键事件**，mobile-mcp 的 `mobile_click`、`mobile_swipe`、`mobile_type_keys` 等才能工作。

| 品牌 | 常见菜单路径 / 名称 |
|------|---------------------|
| **小米 / 红米（MIUI / HyperOS）** | 开发者选项 → **USB 调试（安全设置）**（需登录小米账号 + 插入 SIM，按提示确认约 3 次） |
| **华为 / 荣耀** | 开发者选项 → **「仅充电」模式下允许 ADB 调试** 等；部分机型需 **允许模拟点击** 类选项 |
| **OPPO / 一加 / realme** | 开发者选项 → **禁止权限监控** / **USB 调试（安全设置）** |
| **vivo / iQOO** | 开发者选项 → **USB 调试（安全设置）** |
| **三星** | 开发者选项 → 确认 USB 调试已开；部分机型在 **禁用权限监控** |
| **原生 / Pixel** | 通常仅需 USB 调试；若点击失败再查 OEM 特有项 |

**小米 / 红米用户（常见）：**

1. 开启 **USB 调试（安全设置）** 后 **重启手机**
2. 重新插 USB，再次授权调试
3. 自测模拟点击：

```bash
adb shell input tap 500 500
```

若报 `SecurityException` / `INJECT_EVENTS`，说明安全设置未生效，需回到开发者选项检查。

---

## 与 MCP 模拟点击的关系

```
mobile_run_task
    → mobile-agent
        → mobile-mcp
            → adb / UIAutomator
                → 向系统注入 touch / key 事件  ← 需要 USB 调试（安全设置）
```

| 能力 | 仅 USB 调试 | + USB 调试（安全设置） |
|------|-------------|------------------------|
| `adb devices` 可见 | ✅ | ✅ |
| `mobile_list_devices` | ✅ | ✅ |
| `mobile_take_screenshot` | ✅ 通常可以 | ✅ |
| `mobile_list_elements_on_screen` | ✅ 通常可以 | ✅ |
| **`mobile_click` / 滑动 / 输入** | ❌ 常失败 | ✅ |
| **`mobile_run_task` 完整 UI 流程** | ❌ 无法完成 | ✅ |

因此：**凡是要「点开始采集」「关弹窗」「按指引拍点位」的任务，都必须打开 USB 调试（安全设置）。**

---

## 推荐自检清单（跑自动化前）

- [ ] 开发者模式已开
- [ ] USB 调试已开，且电脑已授权
- [ ] **USB 调试（安全设置）** 已开（小米等必做）
- [ ] 改完安全相关选项后已 **重启手机**（小米建议必做）
- [ ] `adb devices` 显示 `device`
- [ ] `adb shell input tap 500 500` 无 SecurityException
- [ ] `mobile-agent devices --json` 能看到目标设备

---

## 其他真机提示

- **保持屏幕常亮**：长时间自动化时可开「开发者选项 → 不锁定屏幕」或手动保持亮屏
- **关闭误触**：如有「USB 连接时仅充电」改 **文件传输 / MTP**，连接更稳定
- **MIUI 后台限制**：若 App 被杀死，可在应用设置里对目标 App 关闭「省电限制」
- **弹窗**：instruction 里写明「关闭发现设备、权限、网络等弹窗」，Model B 会尝试处理，但点击能力仍依赖上文权限

---

## iOS 简要说明

- **Simulator**：安装 Xcode，启动模拟器即可，一般无需额外「模拟点击」开关
- **真机**：需 Xcode、有效签名；mobile-mcp 通过 WebDriverAgent 等通道操作，与 Android adb 路径不同
- 真机细节见 [mobile-mcp Wiki](https://github.com/mobile-next/mobile-mcp/wiki)

---

## 仍失败时

见 [故障排查 - 小米 INJECT_EVENTS](./troubleshooting.md#小米--红米真机inject_events)。

若仅验证业务逻辑、不涉及点击，可暂时用 **Android 模拟器** 代替真机。
