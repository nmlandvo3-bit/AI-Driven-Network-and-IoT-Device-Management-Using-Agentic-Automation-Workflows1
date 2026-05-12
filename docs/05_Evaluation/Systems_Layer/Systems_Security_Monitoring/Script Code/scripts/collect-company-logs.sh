#!/usr/bin/env bash

set -euo pipefail

SINCE="${1:-today}"

resolve_since() {
  case "$SINCE" in
    today) date '+%Y-%m-%d 00:00:00' ;;
    "last 1 hour"|"1 hour ago") date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S' ;;
    "last 5 days") date -d '5 days ago' '+%Y-%m-%d %H:%M:%S' ;;
    *) date -d "$SINCE" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date '+%Y-%m-%d 00:00:00' ;;
  esac
}

SINCE_RESOLVED="$(resolve_since)"

echo "===HOST==="
hostnamectl || true

echo "===USERS==="
getent passwd employee1 employee2 employee3 intern1 contractor1 || true
getent group company-admins company-employees company-interns company-contractors sudo policy-violators || true

echo "===AUTH_FAILED_SUDO==="
journalctl --since "$SINCE_RESOLVED" 2>/dev/null | grep -Ei "not in the sudoers|authentication failure|incorrect password|COMMAND=" | tail -n 200 || true

echo "===POLICY_WARNINGS==="
journalctl --since "$SINCE_RESOLVED" 2>/dev/null | grep "COMPANY_POLICY_WARNING" | tail -n 200 || true

echo "===AUDIT_SOFTWARE_INSTALL==="
ausearch -k software_install --start "$SINCE_RESOLVED" 2>/dev/null | tail -n 200 || true

echo "===AUDIT_ADMIN_TOOL==="
ausearch -k admin_tool --start "$SINCE_RESOLVED" 2>/dev/null | tail -n 200 || true

echo "===AUDIT_TMP_SCRIPT_EXEC==="
ausearch -k tmp_script_exec --start "$SINCE_RESOLVED" 2>/dev/null | tail -n 200 || true

echo "===AUDIT_PERSISTENCE==="
ausearch -k persistence_attempt --start "$SINCE_RESOLVED" 2>/dev/null | tail -n 200 || true

echo "===AUDIT_DOWNLOADS==="
ausearch -k download_tool --start "$SINCE_RESOLVED" 2>/dev/null | tail -n 200 || true

/usr/local/sbin/check-policy-violations.sh "$SINCE" || true

echo "===CURRENT_USER_APPS==="
ps -eo user,pid,comm,args --sort=user | grep -E 'employee1|employee2|employee3|intern1|contractor1' | grep -v grep || true

echo "===PROCESSES==="
ps aux --sort=-%cpu | head -n 40 || true

echo "===NETWORK==="
ss -tulnp || true
