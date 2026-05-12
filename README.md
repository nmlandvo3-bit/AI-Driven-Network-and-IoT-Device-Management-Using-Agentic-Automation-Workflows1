# MLAB-Project

## Project title

**AI-Driven Network and IoT Device Management Using Agentic Automation Workflows**

## What this project is

MLAB-Project documents and implements a lab system where network, systems, and IoT infrastructure can be monitored and managed through guided agentic automation workflows.

The project combines:

- **Proxmox VE** for virtualization;
- **GNS3 VM** for network simulation;
- **Ubuntu Server VM** for Docker and local n8n automation;
- **n8n** for deterministic workflow orchestration;
- **OpenClaw / NetClaw-style AI bridge** for natural-language interpretation and safety checks;
- **Ollama** for local AI model serving;
- **Telegram/admin chat** as the intended operator interface;
- **IoT/MQTT simulation** for IoT management scenarios.

The central safety idea is that AI can understand and plan, but infrastructure actions must pass through controlled workflows, validation, and human confirmation when the action is risky.

## High-level architecture

```text
Admin / Telegram
      |
      v
OpenClaw AI bridge
      |
      v
n8n workflow orchestration
      |
      v
Proxmox VE + VMs + GNS3 + IoT services
```

## How to read this repository

Start from the lowest level and move upward.

| Level | Folder | What you will find there |
| --- | --- | --- |
| 1 | `docs/01_Project_Minimum_Requirements/` | Project description, minimum requirements, architecture, safety rules, and actual VM inventory. |
| 2 | `docs/02_Proxmox_Setup/` | How to install Proxmox VE on an old PC and prepare the hypervisor. |
| 3 | `docs/03_VMs_Setup/` | One setup folder for each VM currently in Proxmox. |
| 4 | `docs/04_Technology_Setups/` | Setup guides for GNS3 VM, Docker, n8n, Ollama, MQTT/IoT, and Python automation libraries. |
| 5 | `docs/05_Evaluation/` | Empty evaluation structure for Network Layer and Systems Layer documentation, including script-code folders. |

## Where to find specific setup directions

### Project overview and requirements

Read:

```text
docs/01_Project_Minimum_Requirements/README.md
```

Use this when you need to understand what the project is, what the minimum requirements are, and what infrastructure exists.

### Proxmox installation on old PC

Read:

```text
docs/02_Proxmox_Setup/README.md
```

Use this when preparing the physical old PC as the Proxmox host.

### Individual VM setup

Read:

```text
docs/03_VMs_Setup/
```

Current VM folders:

- `100-IOT-CORE/`
- `102-WinEleven/`
- `103-MlabUbuntuServ/`
- `104-GN3VM/`
- `105-UbuntuTest/`
- `106-UbuntuDesk24.04/`
- `107-GNS3-VM107/`

### Technology setup

Read:

```text
docs/04_Technology_Setups/
```

Technology folders:

- `GNS3_VM/`
- `Docker_Ubuntu_Server_VM/`
- `n8n_Local_Ubuntu_Server_VM/`
- `Ollama_Proxmox_Level/`
- `MQTT_IoT_Simulation/`
- `Python_Automation_Libraries/`

### Evaluation documentation

Use:

```text
docs/05_Evaluation/
```

The evaluation folders are intentionally empty skeletons so each person can document their own tests and place their scripts in the included `Script Code/` folders.

Network Layer:

- `Employee_Issue_Reporting_Policy_Validation/`
- `Admin_Network_Operations_Bot/`

Systems Layer:

- `Systems_Infrastructure_Administration/`
- `Systems_Security_Monitoring/`

## Current actual Proxmox VM inventory

Checked through the working project automation path on **2026-05-12**.

| VMID | Name | State | Role |
| --- | --- | --- | --- |
| 100 | IOT-CORE | running | IoT simulation / core services |
| 102 | WinEleven | stopped | Windows endpoint/workstation |
| 103 | MlabUbuntuServ | running | Ubuntu server / Docker / n8n automation stack |
| 104 | GN3VM | stopped | Test or older GNS3 VM |
| 105 | UbuntuTest | running | Ubuntu test endpoint / diagnostics / patching lab |
| 106 | UbuntuDesk24.04 | running | Ubuntu desktop workstation |
| 107 | GNS3-VM107 | running | Production/default GNS3 network lab backend |

## Important safety rules

- Do not commit passwords, API keys, tokens, SSH private keys, or licensed appliance images.
- Use VM 104 or another test VM for risky GNS3 experiments.
- Treat VM 107 as the production GNS3 VM.
- Run read-only checks before state-changing workflows.
- Require human confirmation before start/stop/reboot/patch/rollback actions.
- Keep `config/vm-aliases.json` synchronized with the real Proxmox VM inventory.

## Useful project files

| File | Purpose |
| --- | --- |
| `config/vm-aliases.json` | VM name/alias/VMID registry used by the automation bridge. |
| `docs/source/finalised_report.pdf` | Final project report source used to guide documentation. |
| `docs/source/proxmox-vm-inventory-2026-05-12.json` | Captured VM inventory used by the VM setup docs. |
| `notes/OPENCLAW-TELEGRAM-N8N-BRIDGE-SPEC.md` | Bridge contract and safety behavior. |
| `notes/openclaw-n8n-bridge.md` | n8n webhook and bridge notes. |

## Quick MVP bridge test

From the project root:

```bash
python3 scripts/openclaw_n8n_bridge.py --text "check status of vms"
python3 scripts/openclaw_n8n_bridge.py --text "check status of gns3 vm"
python3 scripts/openclaw_n8n_bridge.py --text "reboot test gns3 vm"
python3 scripts/openclaw_n8n_bridge.py --text "yes"
```

Only use state-changing tests when the lab owner approves.
