# Level 3 — VMs Setup

This folder documents every VM currently found in the Proxmox lab. The inventory was checked through the working n8n/OpenClaw Proxmox status path on **2026-05-12**.

## Current VM list

| VMID | Folder | Proxmox name | State | Role |
| --- | --- | --- | --- | --- |
| 100 | `100-IOT-CORE/` | IOT-CORE | running | IoT simulation / core service VM |
| 102 | `102-WinEleven/` | WinEleven | stopped | Windows endpoint/workstation |
| 103 | `103-MlabUbuntuServ/` | MlabUbuntuServ | running | Ubuntu server / automation stack |
| 104 | `104-GN3VM/` | GN3VM | stopped | Test or older GNS3 VM |
| 105 | `105-UbuntuTest/` | UbuntuTest | running | Ubuntu test endpoint / AI or patching lab |
| 106 | `106-UbuntuDesk24.04/` | UbuntuDesk24.04 | running | Ubuntu desktop workstation |
| 107 | `107-GNS3-VM107/` | GNS3-VM107 | running | Production/default GNS3 network lab backend |

## How to use these folders

Each VM folder contains:

- purpose and role in the project;
- actual Proxmox settings observed from the lab;
- rebuild/setup guidance;
- validation checklist;
- safety notes.

When rebuilding the project, create the VMs in VMID order where possible so that the documentation, aliases, and n8n workflows stay aligned.

## General VM creation pattern

1. In Proxmox, click **Create VM**.
2. Use the documented VMID and name.
3. Select the correct ISO or appliance image.
4. Set CPU, RAM, disk, and network according to the VM folder.
5. Attach to the Proxmox bridge, normally `vmbr0`.
6. Install the OS or import the appliance.
7. Install updates and guest tools where appropriate.
8. Configure SSH/remote access only where needed.
9. Add the VM to `config/vm-aliases.json` if it will be controlled by the automation layer.
10. Test with read-only status commands before enabling state-changing automation.
