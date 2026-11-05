#!/bin/bash
set -euo pipefail

source /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
export PATH="/nix/var/nix/profiles/default/bin:$PATH"
( cd "$CLAUDE_PROJECT_DIR" && devbox shellenv --init-hook=false ) > "$CLAUDE_ENV_FILE"
