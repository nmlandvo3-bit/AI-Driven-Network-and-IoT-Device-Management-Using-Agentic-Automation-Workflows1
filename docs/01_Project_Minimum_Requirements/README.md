# Level 1 — Minimum Requirements and Project Description

## Project title

**AI-Driven Network and IoT Device Management Using Agentic Automation Workflows**

## Short description

This project builds a prototype management system where an administrator can use natural-language chat commands to monitor and manage a virtual network and IoT lab. The system combines AI reasoning with deterministic automation workflows so that AI can understand intent, but sensitive infrastructure actions are still validated, logged, and executed through controlled workflows.

The project is implemented in a simulated lab rather than a production network. The lab combines virtual machines on Proxmox, network simulation with GNS3, workflow automation with n8n, and chat-based operation. Because this is a group project, not every workflow uses the same AI interface: some workflows use OpenClaw/NetClaw as the AI bridge, while other team workflows use n8n AI Agent nodes with Ollama.

## Main goal

Create a safe, guided, semi-autonomous system for network and system administration tasks such as:

- checking VM and network lab status;
- retrieving VM IP information;
- diagnosing resource or service problems;
- starting, stopping, or rebooting VMs with approval;
- creating snapshots before risky work;
- supporting future tasks such as patching, rollback, IoT telemetry, and network device automation.

## Minimum functional requirements

| Requirement | Description |
| --- | --- |
| Natural-language input | Admin can type normal commands such as `check status of vms` or `reboot gns3 vm`. |
| Intent extraction | The AI layer converts natural language into a structured intent such as `list_vm_status` or `reboot_vm`. |
| VM alias resolution | Human-friendly names such as `gns3 vm`, `ubuntu test`, or `n8n server` must map to exact Proxmox VMIDs. |
| Reasoning/execution separation | The AI must not execute infrastructure commands directly. It prepares structured requests; n8n performs controlled execution. |
| Human-in-the-loop approval | Start, stop, reboot, patching, rollback, and other risky actions must require confirmation. |
| Workflow orchestration | n8n routes each request to the correct Proxmox/API/SSH action. |
| Traceability | Requests, workflow results, and safety decisions should be visible in workflow execution history/logs. |
| Safe failure handling | Ambiguous VM names must trigger clarification instead of guessing. Failed actions must return clear messages. |

## Minimum infrastructure requirements

### Hardware

A single old PC can be used as the Proxmox host if it supports virtualization.

Recommended minimum for this project lab:

- 64-bit CPU with Intel VT-x or AMD-V enabled;
- 4 CPU cores minimum, 8+ preferred;
- 32 GB RAM minimum for the full lab, 64 GB preferred;
- 500 GB SSD minimum, 1 TB preferred;
- wired Ethernet connection;
- BIOS/UEFI access so virtualization and boot order can be configured.

### Software/platforms

| Layer | Tool used in this project |
| --- | --- |
| Hypervisor | Proxmox VE |
| Workflow engine | n8n |
| AI/agent interface | Mixed by workflow: OpenClaw/NetClaw bridge for some Systems Layer work; n8n AI Agent + Ollama for other workflows |
| Chat interface | Telegram bot path |
| Network simulation | GNS3 VM |
| VM operating systems | Ubuntu Server/Desktop, Windows 11, GNS3 VM, IoT Core VM |
| Automation access | Proxmox API and SSH |

## Architecture summary

```text
Admin / Telegram
      |
      v
AI workflow layer
- OpenClaw/NetClaw bridge for some workflows
- n8n AI Agent + Ollama for other workflows
- understand request and prepare structured action
      |
      v
n8n workflow
- validate request
- route by intent
- call Proxmox/API/SSH
      |
      v
Proxmox VE host
- runs VMs
- provides status and control
      |
      v
Network / IoT lab VMs
```

## Reasoning model

The report uses the **Observe → Think → Decide → Act** style of agentic workflow:

1. **Observe:** receive the admin request or infrastructure signal.
2. **Think:** interpret what the user wants and identify the target system.
3. **Decide:** choose a safe workflow path and whether approval is needed.
4. **Act:** execute through n8n/Proxmox after validation.

## Current actual Proxmox VM inventory

The inventory below was checked through the working systems-infrastructure Proxmox status path on **2026-05-12**.

| VMID | Name | Node | State | CPU cores | RAM | Disk | Purpose |
| --- | --- | --- | --- | ---: | --- | --- | --- |
| 100 | IOT-CORE | fmtagency | running | 4 | 8 GB | 100 GB | IoT simulation / core services |
| 102 | WinEleven | fmtagency | stopped | 8 | 7.9 GB | 100 GB | Windows endpoint/workstation |
| 103 | MlabUbuntuServ | fmtagency | running | 8 | 12 GB | 100 GB | Ubuntu server / automation stack, likely n8n host |
| 104 | GN3VM | fmtagency | stopped | 6 | 12 GB | 19.5 GB | Older/test GNS3 VM |
| 105 | UbuntuTest | fmtagency | running | 4 | 16 GB | 100 GB | Ubuntu test endpoint / AI or patching lab |
| 106 | UbuntuDesk24.04 | fmtagency | running | 8 | 16 GB | 150 GB | Ubuntu desktop workstation |
| 107 | GNS3-VM107 | fmtagency | running | 8 | 16 GB | 19.5 GB | Production GNS3 network lab backend |

## Safety rules for anyone reproducing the project

- Do read-only tests first: status, inventory, IP lookup.
- Use VM 104 or another test VM for risky testing.
- Treat VM 107 as the production/default GNS3 lab VM.
- Do not run destructive actions without confirmation.
- Do not store passwords, API keys, Telegram tokens, or SSH private keys in GitHub.
- Keep the VM alias registry updated whenever VMs are added, renamed, or removed.

## What this level does not cover yet

This level only gives the outer project description and minimum requirements. The next folders document:

- Proxmox installation on the old PC;
- individual VM setup;
- later levels for n8n, AI-agent approaches, Telegram, GNS3 topologies, IoT simulation, and final testing.
