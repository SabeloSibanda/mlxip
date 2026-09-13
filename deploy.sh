#!/bin/bash
# Deploy mlxip.com to Hostinger via FTP/SFTP
# Usage: ./deploy.sh
#
# Fill in your Hostinger FTP details (from hPanel -> Files -> FTP Accounts):
FTP_HOST=""    # e.g. ftp.mlxip.com or the IP from hPanel
FTP_USER=""    # e.g. u123456789
FTP_PASS=""    # your FTP password
FTP_DIR=""     # usually public_html or domains/mlxip.com/public_html

set -euo pipefail
if [ -z "$FTP_HOST" ]; then echo "Edit deploy.sh and fill in FTP_HOST/FTP_USER/FTP_PASS/FTP_DIR first."; exit 1; fi

lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<EOF
set ssl:check-hostname no
set ftp:ssl-allow yes
mirror --reverse --delete --exclude-glob .git* --exclude-glob deploy.sh --exclude-glob .DS_Store --exclude-glob README.md --exclude-glob copy/ --exclude-glob assets/references/ . $FTP_DIR
bye
EOF
echo "Deployed to Hostinger."
