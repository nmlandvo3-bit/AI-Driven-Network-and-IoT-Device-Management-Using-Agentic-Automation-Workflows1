# Script Inventory

This file documents scripts and command bodies found inside the main Systems Infrastructure and Administration workflow and its sub-workflows.

The workflow files are n8n exports; the script files here are extracted copies to make review and documentation easier.

## Main workflow relationship

`Proxmox Admin Bot` is the main workflow. It calls `OpenClaw Proxmox Orchestrator`, which then calls the Proxmox sub-workflows listed in `../n8n_workflows/README.md`.

## Extracted scripts

| Workflow | Node | Type | Extracted file | Notes |
| --- | --- | --- | --- | --- |
| Proxmox Admin Bot | Code in JavaScript | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__02-code-in-javascript.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Code in JavaScript1 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__03-code-in-javascript1.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Parse Command | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__06-parse-command.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Code in JavaScript2 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__10-code-in-javascript2.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | VM List | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__12-vm-list.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Validate VMID | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__14-validate-vmid.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Validate VMID1 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__22-validate-vmid1.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Validate VMID2 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__30-validate-vmid2.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Validate VMID3 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__39-validate-vmid3.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Code in JavaScript3 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__43-code-in-javascript3.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Execute a command | n8n-nodes-base.ssh | SSH Commands/01-proxmox-admin-bot__45-execute-a-command.sh | SSH command executed on Proxmox/VM |
| Proxmox Admin Bot | Code in JavaScript4 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__49-code-in-javascript4.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Code in JavaScript5 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__50-code-in-javascript5.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Code in JavaScript6 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__55-code-in-javascript6.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Execute a command1 | n8n-nodes-base.ssh | SSH Commands/01-proxmox-admin-bot__58-execute-a-command1.sh | SSH command executed on Proxmox/VM |
| Proxmox Admin Bot | Code in JavaScript7 | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__61-code-in-javascript7.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Format Orchestrator Reply | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__63-format-orchestrator-reply.js | JavaScript code node inside n8n |
| Proxmox Admin Bot | Mlab Admin Main Router | n8n-nodes-base.code | Code Nodes/01-proxmox-admin-bot__65-mlab-admin-main-router.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Parse OpenClaw Request | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__02-parse-openclaw-request.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Format VM List | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__05-format-vm-list.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Format Single VM Status | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__08-format-single-vm-status.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Split VMs For IP Lookup | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__11-split-vms-for-ip-lookup.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Parse VM IP | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__14-parse-vm-ip.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Mark VM Not Running | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__15-mark-vm-not-running.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Format All VM IPs | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__17-format-all-vm-ips.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Prepare Start | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__22-prepare-start.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Prepare Stop | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__30-prepare-stop.js | JavaScript code node inside n8n |
| OpenClaw Proxmox Orchestrator | Prepare Reboot | n8n-nodes-base.code | Code Nodes/02-openclaw-proxmox-orchestrator__38-prepare-reboot.js | JavaScript code node inside n8n |
| Sub-Proxmox-IP-Resolver | Normalize Input | n8n-nodes-base.code | Code Nodes/03-sub-proxmox-ip-resolver__03-normalize-input.js | JavaScript code node inside n8n |
| Sub-Proxmox-IP-Resolver | SSH: Resolve VM IP From Proxmox | n8n-nodes-base.ssh | SSH Commands/03-sub-proxmox-ip-resolver__04-ssh-resolve-vm-ip-from-proxmox.sh | SSH command executed on Proxmox/VM |
| Sub-Proxmox-IP-Resolver | Parse Resolver Output | n8n-nodes-base.code | Code Nodes/03-sub-proxmox-ip-resolver__05-parse-resolver-output.js | JavaScript code node inside n8n |
| Sub-Proxmox-Resource-Diagnostics | Normalize Input | n8n-nodes-base.code | Code Nodes/04-sub-proxmox-resource-diagnostics__03-normalize-input.js | JavaScript code node inside n8n |
| Sub-Proxmox-Resource-Diagnostics | SSH: Collect Proxmox Metrics | n8n-nodes-base.ssh | SSH Commands/04-sub-proxmox-resource-diagnostics__04-ssh-collect-proxmox-metrics.sh | SSH command executed on Proxmox/VM |
| Sub-Proxmox-Resource-Diagnostics | Parse Proxmox Metrics | n8n-nodes-base.code | Code Nodes/04-sub-proxmox-resource-diagnostics__05-parse-proxmox-metrics.js | JavaScript code node inside n8n |
| Sub-Proxmox-Resource-Diagnostics | SSH: Guest OS Diagnostics | n8n-nodes-base.ssh | SSH Commands/04-sub-proxmox-resource-diagnostics__06-ssh-guest-os-diagnostics.sh | SSH command executed on Proxmox/VM |
| Sub-Proxmox-Resource-Diagnostics | Format Diagnostics | n8n-nodes-base.code | Code Nodes/04-sub-proxmox-resource-diagnostics__07-format-diagnostics.js | JavaScript code node inside n8n |
| Sub-Proxmox-Snapshot-Manager | Normalize Input | n8n-nodes-base.code | Code Nodes/05-sub-proxmox-snapshot-manager__03-normalize-input.js | JavaScript code node inside n8n |
| Sub-Proxmox-Snapshot-Manager | SSH: Snapshot Manager | n8n-nodes-base.ssh | SSH Commands/05-sub-proxmox-snapshot-manager__04-ssh-snapshot-manager.sh | SSH command executed on Proxmox/VM |
| Sub-Proxmox-Snapshot-Manager | Format Snapshot Result | n8n-nodes-base.code | Code Nodes/05-sub-proxmox-snapshot-manager__05-format-snapshot-result.js | JavaScript code node inside n8n |
| Sub-Proxmox-Safe-Patching | Normalize / Confirmation Gate | n8n-nodes-base.code | Code Nodes/06-sub-proxmox-safe-patching__03-normalize-confirmation-gate.js | JavaScript code node inside n8n |
| Sub-Proxmox-Safe-Patching | Return Confirmation Required | n8n-nodes-base.code | Code Nodes/06-sub-proxmox-safe-patching__05-return-confirmation-required.js | JavaScript code node inside n8n |
| Sub-Proxmox-Safe-Patching | SSH: Patch Ubuntu Test | n8n-nodes-base.ssh | SSH Commands/06-sub-proxmox-safe-patching__07-ssh-patch-ubuntu-test.sh | SSH command executed on Proxmox/VM |
| Sub-Proxmox-Safe-Patching | Format Safe Patch Result | n8n-nodes-base.code | Code Nodes/06-sub-proxmox-safe-patching__08-format-safe-patch-result.js | JavaScript code node inside n8n |
| Sub-Proxmox-Ghost-VM-Recovery | Normalize Input | n8n-nodes-base.code | Code Nodes/07-sub-proxmox-ghost-vm-recovery__03-normalize-input.js | JavaScript code node inside n8n |
| Sub-Proxmox-Ghost-VM-Recovery | Format Recovery Advice | n8n-nodes-base.code | Code Nodes/07-sub-proxmox-ghost-vm-recovery__05-format-recovery-advice.js | JavaScript code node inside n8n |
| Sub-Proxmox-Idle-Lab-Cleanup | Analyze Idle Candidates | n8n-nodes-base.code | Code Nodes/08-sub-proxmox-idle-lab-cleanup__04-analyze-idle-candidates.js | JavaScript code node inside n8n |

## How to use this folder

- `SSH Commands/` contains shell command bodies executed through n8n SSH nodes against Proxmox or guest VMs.
- `Code Nodes/` contains JavaScript from n8n Code nodes.
- `openclaw_n8n_bridge.py` is the local bridge/helper script used by the OpenClaw/NetClaw path.

Do not add secrets to these files. If a script requires credentials, document the credential name and configure it inside n8n or the VM runtime.
