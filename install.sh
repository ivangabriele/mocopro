#!/bin/bash
set -e

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
  x86_64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
esac

INSTALL_DIR="${HOME}/.local/bin"
mkdir -p "$INSTALL_DIR"

URL="https://github.com/ivangabriele/mocopro/releases/latest/download/mocopro-${OS}-${ARCH}"

echo "[INSTALL] Downloading mocopro..."
curl -fsSL "$URL" -o "${INSTALL_DIR}/mocopro"
chmod +x "${INSTALL_DIR}/mocopro"

echo "[INSTALL] mocopro installed to ${INSTALL_DIR}/mocopro"

# Check if in PATH
if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
  echo ""
  echo "Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
fi
