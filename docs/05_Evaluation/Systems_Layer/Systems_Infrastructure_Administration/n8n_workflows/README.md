# n8n Workflows

This folder contains sanitized exports of the main Systems Infrastructure and Administration n8n workflow and all sub-workflows it calls.

## Call chain

```text
Proxmox Admin Bot
└── OpenClaw Proxmox Orchestrator
    ├── Sub-Proxmox-IP-Resolver
    ├── Sub-Proxmox-Resource-Diagnostics
    ├── Sub-Proxmox-Snapshot-Manager
    ├── Sub-Proxmox-Safe-Patching
    │   └── Sub-Proxmox-Snapshot-Manager
    ├── Sub-Proxmox-Ghost-VM-Recovery
    │   └── Sub-Proxmox-IP-Resolver
    └── Sub-Proxmox-Idle-Lab-Cleanup
```

## Included workflow exports

| File | Workflow | Active when exported | Purpose |
| --- | --- | --- | --- |
| `01-proxmox-admin-bot.workflow.json` | Proxmox Admin Bot | True | Main Telegram/admin workflow. Routes classic Proxmox commands and newer natural-language systems requests. |
| `02-openclaw-proxmox-orchestrator.workflow.json` | OpenClaw Proxmox Orchestrator | True | Sub-workflow called by the main bot for normalized Proxmox/VM operations. |
| `03-sub-proxmox-ip-resolver.workflow.json` | Sub-Proxmox-IP-Resolver | True | Resolves VM IP addresses from Proxmox using MAC/neighbor discovery. |
| `04-sub-proxmox-resource-diagnostics.workflow.json` | Sub-Proxmox-Resource-Diagnostics | True | Collects CPU/RAM/disk/resource diagnostics for a target VM. |
| `05-sub-proxmox-snapshot-manager.workflow.json` | Sub-Proxmox-Snapshot-Manager | True | Creates or rolls back Proxmox VM snapshots. |
| `06-sub-proxmox-safe-patching.workflow.json` | Sub-Proxmox-Safe-Patching | True | Creates a safety snapshot, applies package updates, and reports patch result. |
| `07-sub-proxmox-ghost-vm-recovery.workflow.json` | Sub-Proxmox-Ghost-VM-Recovery | True | Diagnoses a VM that is running but unreachable and attempts safe recovery checks. |
| `08-sub-proxmox-idle-lab-cleanup.workflow.json` | Sub-Proxmox-Idle-Lab-Cleanup | True | Finds idle/stopped/resource-heavy lab VMs and suggests cleanup. |

## Security note

Workflow exports are sanitized. Credentials, private keys, and API tokens must be configured inside n8n and must not be committed to GitHub.
