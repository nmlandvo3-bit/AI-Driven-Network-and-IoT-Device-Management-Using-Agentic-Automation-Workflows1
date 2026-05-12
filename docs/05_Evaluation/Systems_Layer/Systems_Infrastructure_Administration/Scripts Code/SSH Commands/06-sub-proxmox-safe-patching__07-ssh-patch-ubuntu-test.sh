# Workflow: Sub-Proxmox-Safe-Patching (thsz2pCu12NxVYfB)
# Node: SSH: Patch Ubuntu Test
# Node type: n8n-nodes-base.ssh
# Purpose: SSH command executed by n8n. Review before reuse.

={{ `set -e
echo '===PRECHECK==='
hostname
uptime
free -h
df -h /
echo '===APT_UPDATE==='
sudo apt update
echo '===UPGRADABLE_BEFORE==='
apt list --upgradable 2>/dev/null | head -40 || true
if ${$json.apply_upgrade ? 'true' : 'false'}; then
  echo '===APT_UPGRADE==='
  sudo DEBIAN_FRONTEND=noninteractive apt -y upgrade
else
  echo '===APT_UPGRADE_SKIPPED==='
fi
echo '===HEALTH_AFTER==='
uptime
free -h
df -h /
systemctl --failed --no-pager || true
` }}
