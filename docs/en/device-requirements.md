# Android Device Requirements

[中文](../zh/device-requirements.md)

On **Android physical devices**, `mobile_run_task` tap/swipe/type actions require more than a visible `adb devices` entry.

> **Emulators** usually have no extra tap restrictions.  
> **iOS** notes at the bottom.

---

## Required settings

### 1. Developer mode

Settings → About phone → tap **Build number** 7 times → Developer options

### 2. USB debugging

Enable and authorize this computer when prompted.

```bash
adb devices   # should show "device"
```

### 3. USB debugging (security settings) — required for simulated taps

Allows adb to **inject touch/key events**. Required for `mobile_click`, `mobile_swipe`, etc.

| OEM | Setting name |
|-----|--------------|
| **Xiaomi / Redmi** | **USB debugging (security settings)** (Mi account + SIM; confirm ~3 times; **reboot**) |
| **Huawei / Honor** | Allow ADB in charge-only mode, etc. |
| **OPPO / OnePlus / realme** | USB debugging (security settings) |
| **vivo / iQOO** | USB debugging (security settings) |
| **Samsung / Pixel** | Often USB debugging alone; check OEM options if taps fail |

Self-test:

```bash
adb shell input tap 500 500
```

`SecurityException` / `INJECT_EVENTS` → security setting not active.

---

## MCP simulated taps

| Capability | USB debugging only | + Security settings |
|------------|----------------------|---------------------|
| `adb devices` / list devices | ✅ | ✅ |
| Screenshot / read UI tree | ✅ usually | ✅ |
| **Tap / swipe / type** | ❌ | ✅ |
| **Full `mobile_run_task` flow** | ❌ | ✅ |

---

## Pre-flight checklist

- [ ] Developer mode on
- [ ] USB debugging + PC authorized
- [ ] **USB debugging (security settings)** on
- [ ] **Reboot phone** after changing security options (Xiaomi)
- [ ] `adb shell input tap 500 500` succeeds
- [ ] `mobile-agent devices --json` shows target device

---

## Other tips

- Keep screen on; use **File transfer / MTP** USB mode
- Disable battery restrictions for target app on MIUI
- Mention “close all popups” in task instructions

---

## iOS

- **Simulator**: start via Xcode
- **Device**: Xcode + signing; see [mobile-mcp Wiki](https://github.com/mobile-next/mobile-mcp/wiki)

---

If still failing: [Troubleshooting — INJECT_EVENTS](./troubleshooting.md#xiaomi--redmi-inject_events).
