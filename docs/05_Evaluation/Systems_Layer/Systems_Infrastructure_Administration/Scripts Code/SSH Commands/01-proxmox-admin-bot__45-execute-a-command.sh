# Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
# Node: Execute a command
# Node type: n8n-nodes-base.ssh
# Purpose: SSH command executed by n8n. Review before reuse.

=echo "{{$json.sshPassword}}" | sudo -S apt update -qq && apt list --upgradable
