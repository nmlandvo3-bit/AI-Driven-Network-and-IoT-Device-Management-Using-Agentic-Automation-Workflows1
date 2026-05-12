# GNS3 VM Setup

## Purpose

The GNS3 VM provides the network simulation backend for the project. It runs virtual routers, switches, firewalls, and network appliances used by the Network Layer evaluation.

In the current lab, the main GNS3 backend is:

| Field | Value |
| --- | --- |
| VMID | `107` |
| Proxmox name | `GNS3-VM107` |
| Role | production/default GNS3 network lab backend |
| CPU | 8 cores |
| RAM | 16 GB |
| Disk | 19.5 GB |

VM `104` / `GN3VM` is the stopped test or older GNS3 VM.

## Official/reference documentation

- GNS3 documentation: <https://docs.gns3.com/>
- GNS3 VM downloads: <https://www.gns3.com/software/download-vm>
- Proxmox installation guidance remains in `docs/02_Proxmox_Setup/`.

## Setup steps

1. Download the GNS3 VM appliance from the official GNS3 site.
2. In Proxmox, create or import a VM for the GNS3 backend.
3. Use the documented project VMID where possible:
   - production GNS3: `107` / `GNS3-VM107`;
   - test GNS3: `104` / `GN3VM`.
4. Allocate at least:
   - 4 CPU cores minimum, 8 preferred;
   - 8 GB RAM minimum, 16 GB preferred;
   - 20 GB disk minimum.
5. Attach the VM to the lab bridge, normally `vmbr0`.
6. Start the VM and complete any first-boot setup.
7. Open the GNS3 GUI from the Ubuntu Desktop workstation or another admin PC.
8. Add the GNS3 VM as the remote/local compute backend in GNS3 preferences.
9. Import required router/switch/firewall images according to licensing rules.
10. Build or import the project network topology.

## Validation

- GNS3 GUI can connect to `GNS3-VM107`.
- A test appliance can start successfully.
- Network nodes can connect through the intended bridges/cloud nodes.
- GNS3 VM is visible in the Proxmox status summary.

## Safety notes

- Treat VM 107 as production for the project.
- Use VM 104 for risky or destructive GNS3 tests.
- Do not commit Cisco IOS images or licensed appliance images to GitHub.
