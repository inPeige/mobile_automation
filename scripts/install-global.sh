#!/usr/bin/env bash
# 全局安装到 ~/.local/share/mobile-automation，与项目路径解耦。
set -euo pipefail

SOURCE="$(cd "$(dirname "$0")/.." && pwd)"
INSTALL_DIR="${MOBILE_AUTOMATION_HOME:-$HOME/.local/share/mobile-automation}"

echo "==> 复制到 $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete \
    --exclude node_modules \
    --exclude dist \
    "$SOURCE/" "$INSTALL_DIR/"
else
  rm -rf "$INSTALL_DIR"/*
  cp -R "$SOURCE/." "$INSTALL_DIR/"
  rm -rf "$INSTALL_DIR/node_modules" "$INSTALL_DIR/dist"
fi

cd "$INSTALL_DIR"

echo "==> 安装依赖"
npm install

echo "==> 编译"
npm run build

echo "==> 注册全局命令"
npm install -g .

BIN_DIR="$(npm prefix -g)/bin"
if ! command -v mobile-bridge-mcp >/dev/null 2>&1; then
  echo "警告: mobile-bridge-mcp 不在 PATH。请加入 ~/.zshrc:"
  echo "  export PATH=\"$BIN_DIR:\$PATH\""
fi

echo ""
echo "=========================================="
echo "  全局安装完成 → $INSTALL_DIR"
echo "  $(mobile-agent version 2>/dev/null || true)"
echo "=========================================="
echo ""
echo "日常命令（任意目录）:"
echo "  mobile-agent version"
echo "  mobile-agent devices --json"
echo "  mobile-automation-update    # 以后升级用这个，不用回项目"
echo ""
echo "MCP 配置（用户级，只需配一次）~/.cursor/mcp.json 或 Kiro MCP:"
echo '  "mobile-bridge": { "command": "mobile-bridge-mcp", "env": { "MOBILEMCP_DISABLE_TELEMETRY": "1" } }'
echo ""
echo "Model B 需要 Cursor CLI: agent login"
echo ""
