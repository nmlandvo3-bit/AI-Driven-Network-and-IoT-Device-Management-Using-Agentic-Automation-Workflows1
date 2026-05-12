# Systems Infrastructure and Administration

This folder documents our Systems Layer infrastructure-administration workflow operations.

The current main workflow for this part is **Proxmox Admin Bot**. It calls `OpenClaw Proxmox Orchestrator` as a sub-workflow, and that orchestrator calls additional Proxmox sub-workflows for IP resolution, diagnostics, snapshots, safe patching, ghost-VM recovery, and idle cleanup.

## Important correction

The project was completed as a group. The OpenClaw/NetClaw approach was used for this systems-infrastructure workflow path, but it was not the only AI approach used in the whole project. Other teammates created other n8n workflows for other layers, including workflows where the AI layer is implemented with n8n AI Agent nodes and Ollama.

## Folder structure

| Folder | Purpose |
| --- | --- |
| `SCENARIOS_AND_EXPECTATIONS.md` | Evaluation scenarios, expected behavior, and evidence checklist for this Systems Infrastructure workflow. |
| `n8n_workflows/` | Sanitized exported n8n workflow JSON files: main workflow plus all called sub-workflows. |
| `Scripts Code/` | Extracted scripts and command bodies used inside workflow nodes, including SSH commands and n8n Code node JavaScript. |

## What to document here later

- main workflow purpose and sub-workflow purpose;
- workflow screenshots;
- n8n node-by-node explanation;
- input and output examples;
- test cases;
- scripts used;
- observed results;
- limitations and future improvements.

## Current workflow call chain

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

See `SCENARIOS_AND_EXPECTATIONS.md` for what to test, and see `n8n_workflows/README.md` plus `Scripts Code/SCRIPT-INVENTORY.md` for the detailed exported workflows and extracted scripts.
