#!/usr/bin/env bash

set -euo pipefail

THRESHOLD=5
USERS=("employee1" "employee2" "employee3" "intern1" "contractor1")
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

echo "===POLICY_VIOLATION_REPORT==="
echo "host=$(hostname)"
echo "checked_at=$(date -Is)"
echo "timeframe=$SINCE"
echo "since_resolved=$SINCE_RESOLVED"
echo "threshold=$THRESHOLD"
echo

for USER in "${USERS[@]}"; do
  FAILED_SUDO=$(journalctl --since "$SINCE_RESOLVED" 2>/dev/null | grep -Ei "$USER.*(not in the sudoers|authentication failure|incorrect password)" | wc -l || true)
  POLICY_WARNINGS=$(journalctl --since "$SINCE_RESOLVED" 2>/dev/null | grep "COMPANY_POLICY_WARNING user=$USER" | wc -l || true)
  SUDO_COMMANDS=$(journalctl --since "$SINCE_RESOLVED" 2>/dev/null | grep -Ei "sudo: $USER .* COMMAND=" | wc -l || true)
  PERSISTENCE_ATTEMPT=$(ausearch -k persistence_attempt --start "$SINCE_RESOLVED" 2>/dev/null | grep -c "auid=" || true)
  TMP_SCRIPT_EXEC=$(ausearch -k tmp_script_exec --start "$SINCE_RESOLVED" 2>/dev/null | grep -c "auid=" || true)

  TOTAL=$((FAILED_SUDO + POLICY_WARNINGS))

  if [ "$TOTAL" -ge "$THRESHOLD" ]; then
    STATUS="NEEDS_ATTENTION"
    usermod -aG policy-violators "$USER" 2>/dev/null || true
  else
    STATUS="OK"
  fi

  echo "USER=$USER"
  echo "status=$STATUS"
  echo "failed_sudo=$FAILED_SUDO"
  echo "policy_warnings=$POLICY_WARNINGS"
  echo "sudo_commands=$SUDO_COMMANDS"
  echo "tmp_script_exec=$TMP_SCRIPT_EXEC"
  echo "software_install=$POLICY_WARNINGS"
  echo "persistence_attempt=$PERSISTENCE_ATTEMPT"
  echo "total_violations=$TOTAL"
  echo "---"
done
