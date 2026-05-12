# Level 2 — Proxmox Setup on an Old PC

## Purpose

This folder documents how to prepare an old PC as the Proxmox VE host for the MLAB project. Proxmox is the base platform that runs all project VMs: n8n/automation server, GNS3, Ubuntu test machines, Windows endpoint, and IoT Core.

Official Proxmox references used for this guidance:

- Proxmox VE installation documentation: <https://pve.proxmox.com/pve-docs/chapter-pve-installation.html>
- Proxmox installation/get started page: <https://www.proxmox.com/en/products/proxmox-virtual-environment/get-started>
- Proxmox VE downloads: <https://www.proxmox.com/en/downloads/proxmox-virtual-environment>
- Proxmox hardware requirements: <https://www.proxmox.com/en/proxmox-virtual-environment/requirements>
- Prepare installation media: <https://pve.proxmox.com/wiki/Prepare_Installation_Media>

## Target setup used by this project

| Item | Project value |
| --- | --- |
| Proxmox node name | `fmtagency` |
| Proxmox role | Main hypervisor for all lab VMs |
| VM type | QEMU/KVM virtual machines |
| Network style | Bridged network so VMs can reach the LAN |
| Current VM count | 7 VMs |

## Hardware checklist

For a learning/project lab, an old PC is acceptable if it meets these minimums:

- 64-bit CPU;
- Intel VT-x or AMD-V virtualization support enabled in BIOS/UEFI;
- 4 CPU cores minimum, 8+ preferred;
- 32 GB RAM minimum for this full lab, 64 GB preferred;
- SSD storage strongly recommended;
- 500 GB storage minimum, 1 TB preferred;
- wired Ethernet connection;
- USB flash drive for installation media;
- monitor and keyboard for installation.

## Before installation

1. Back up anything important from the old PC. Installing Proxmox normally erases the target disk.
2. Enter BIOS/UEFI settings.
3. Enable virtualization:
   - Intel: VT-x / Intel Virtualization Technology;
   - AMD: SVM / AMD-V.
4. Enable booting from USB.
5. Connect the PC to the router/switch using Ethernet.
6. Decide the hostname and management IP plan before installing.

Recommended hostname for reproducing this project:

```text
fmtagency
```

## Download Proxmox VE

1. Open the official Proxmox VE downloads page:
   <https://www.proxmox.com/en/downloads/proxmox-virtual-environment>
2. Download the latest Proxmox VE ISO installer.
3. Verify the downloaded file if checksums are provided.

## Create the bootable USB

Use a tool such as Balena Etcher, Rufus, Ventoy, or `dd` on Linux.

Linux example:

```bash
lsblk
sudo dd if=proxmox-ve_VERSION.iso of=/dev/sdX bs=4M status=progress oflag=sync
```

Replace `/dev/sdX` with the correct USB device. Be careful: the wrong device can erase a disk.

## Install Proxmox VE

1. Boot the old PC from the Proxmox USB installer.
2. Choose **Install Proxmox VE**.
3. Accept the license agreement.
4. Select the target disk.
5. Choose country, timezone, and keyboard layout.
6. Set the root password and admin email.
7. Configure network:
   - hostname: `fmtagency`;
   - management IP: choose a static LAN IP;
   - gateway: your router IP;
   - DNS: router or public resolver.
8. Review settings and install.
9. Reboot and remove the USB drive.

## First login

From another computer on the same LAN, open:

```text
https://<proxmox-ip>:8006
```

Login as:

```text
user: root
realm: Linux PAM
```

The browser may warn about a self-signed certificate. This is expected in a lab.

## Initial post-install configuration

### 1. Confirm host identity

Open the Proxmox shell and check:

```bash
hostname
ip addr
pveversion
```

### 2. Update package repositories

For a lab without a paid subscription, configure the no-subscription repository according to the official Proxmox documentation, then update:

```bash
apt update
apt full-upgrade -y
reboot
```

### 3. Confirm bridge networking

The default Proxmox install normally creates `vmbr0`. This bridge lets VMs connect to the LAN through the physical NIC.

Check:

```bash
ip addr show vmbr0
cat /etc/network/interfaces
```

A simple bridge layout normally looks like this conceptually:

```text
Physical NIC -> vmbr0 -> VMs
```

### 4. Create storage locations

Use the default storage if this is a simple lab. For larger labs, consider separate storage for:

- ISO images;
- VM disks;
- backups;
- snapshots.

### 5. Upload ISO images

In the Proxmox web UI:

1. Select the node.
2. Open storage, usually `local`.
3. Go to **ISO Images**.
4. Upload Ubuntu Server, Ubuntu Desktop, Windows ISO, and any other installer images needed.

## Create VMs

Use the next folder for exact VM documentation:

```text
docs/03_VMs_Setup/
```

General VM creation steps:

1. Click **Create VM**.
2. Set VMID and name.
3. Select OS ISO.
4. Choose system settings, disk, CPU, RAM, and network.
5. Use bridge `vmbr0` unless a special isolated network is needed.
6. Start the VM and install the OS.
7. Install guest tools where appropriate.
8. Record the VM in the documentation and alias registry.

## Current actual Proxmox host inventory

Checked through the project automation path on 2026-05-12:

| VMID | Name | State | CPU | RAM | Disk |
| --- | --- | --- | ---: | --- | --- |
| 100 | IOT-CORE | running | 4 cores | 8 GB | 100 GB |
| 102 | WinEleven | stopped | 8 cores | 7.9 GB | 100 GB |
| 103 | MlabUbuntuServ | running | 8 cores | 12 GB | 100 GB |
| 104 | GN3VM | stopped | 6 cores | 12 GB | 19.5 GB |
| 105 | UbuntuTest | running | 4 cores | 16 GB | 100 GB |
| 106 | UbuntuDesk24.04 | running | 8 cores | 16 GB | 150 GB |
| 107 | GNS3-VM107 | running | 8 cores | 16 GB | 19.5 GB |

## Recommended operating rules

- Keep Proxmox root access limited.
- Use API tokens or dedicated SSH keys for automation.
- Do not expose port `8006` directly to the public internet.
- Keep backups before risky VM changes.
- Test automation against non-critical VMs first.
- Label VMs clearly and keep VMIDs consistent with documentation.

## Verification checklist

After Proxmox setup is complete:

- [ ] Proxmox web UI opens on `https://<ip>:8006`.
- [ ] Hostname is set correctly.
- [ ] `vmbr0` bridge exists and is connected to the LAN.
- [ ] Storage is visible.
- [ ] ISO upload works.
- [ ] A test VM can be created and started.
- [ ] VMs can reach the network.
- [ ] Automation user/API access is planned but secrets are not committed to Git.
