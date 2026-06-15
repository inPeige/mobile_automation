#!/usr/bin/env bash
# 从 ~/.local/share/mobile-automation 重新编译并全局安装（任意目录可执行）。
set -euo pipefail

INSTALL_DIR="${MOBILE_AUTOMATION_HOME:-$HOME/.local/share/mobile-automation}"

if [[ ! -d "$INSTALL_DIR" ]]; then
  echo "未找到安装目录: $INSTALL_DIR"
  echo "请先运行 install-global.sh 完成首次安装。"
  exit 1
fi

cd "$INSTALL_DIR"

echo "==> 更新 @realsee/mobile-automation @ $INSTALL_DIR"
npm install
npm run build
npm install -g .

echo ""
echo "更新完成: $(mobile-agent version 2>/dev/null || echo 'run mobile-agent version')"
echo "请重启 Cursor / Kiro MCP 以加载新版本。"
