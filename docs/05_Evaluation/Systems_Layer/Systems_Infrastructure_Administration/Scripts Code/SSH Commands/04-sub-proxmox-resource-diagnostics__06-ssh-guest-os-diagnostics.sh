# Workflow: Sub-Proxmox-Resource-Diagnostics (uXZIZQhGiNHp2SkW)
# Node: SSH: Guest OS Diagnostics
# Node type: n8n-nodes-base.ssh
# Purpose: SSH command executed by n8n. Review before reuse.

={{ `echo '===HOST==='; hostname; echo '===UPTIME==='; uptime; echo '===MEMORY==='; free -h; echo '===DISK==='; df -h --total | tail -n +1; echo '===TOP_CPU==='; ps aux --sort=-%cpu | head -6; echo '===TOP_MEM==='; ps aux --sort=-%mem | head -6; echo '===SERVICES==='; systemctl --failed --no-pager || true` }}
