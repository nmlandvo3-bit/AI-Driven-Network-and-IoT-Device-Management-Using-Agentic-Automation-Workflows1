# AI-Driven Network and IoT Device Management Using Agentic Automation Workflows

## Purpose

Dedicated workspace for the undergraduate project on AI-driven network and IoT device management using agentic automation workflows.

## Documentation levels

- `docs/01_Project_Minimum_Requirements/` — outer-layer project description, minimum requirements, architecture, and actual VM inventory.
- `docs/02_Proxmox_Setup/` — guidance for installing Proxmox VE on an old PC and preparing the hypervisor.
- `docs/03_VMs_Setup/` — per-VM setup folders matching the current Proxmox lab.

## Main documentation

- `docs/PROJECT-HANDOVER.md` — complete build/rebuild handover guide for another person to reproduce the project.
- `docs/openclaw-n8n-telegram-integration-guide.pdf` — formatted integration guide.
- `notes/OPENCLAW-TELEGRAM-N8N-BRIDGE-SPEC.md` — bridge contract and safety rules.
- `notes/openclaw-n8n-bridge.md` — live n8n webhook and operator notes.
- `notes/VM-ALIAS-RESOLUTION.md` — VM alias matching and ambiguity policy.

## Current source artifact

- `docs/source/final_report_progress.pdf`
- extracted text: `docs/source/final_report_progress.txt`
- page images for diagram-aware review: `docs/source/final_report_progress_page-*.png`

## Working areas

- `docs/source/` original and extracted source material
- `notes/` project notes, summaries, and action items
- `skills/` project-specific skills or helpers if needed

## Initial project reading

The report appears to focus on:
- AI-assisted network and IoT management
- agentic automation workflows
- n8n as an orchestration layer
- virtualized infrastructure and simulated network environments
- human oversight and safe execution boundaries

## Quick MVP test

From the project root:

```bash
python3 scripts/openclaw_n8n_bridge.py --text "check status of vms"
python3 scripts/openclaw_n8n_bridge.py --text "check status of gns3 vm"
python3 scripts/openclaw_n8n_bridge.py --text "reboot test gns3 vm"
python3 scripts/openclaw_n8n_bridge.py --text "yes"
```

Read `docs/PROJECT-HANDOVER.md` first if you are rebuilding or handing over the project.
