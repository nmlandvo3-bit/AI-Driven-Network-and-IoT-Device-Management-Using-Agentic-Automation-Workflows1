# VM 103 — MlabUbuntuServ

## Role in the project

**Canonical documentation name:** `mlab-ubuntu-server`  
**Role:** Ubuntu server / automation stack  
**Purpose:** Runs core server-side services for the lab. In this project it is associated with the n8n automation server path.

## Actual Proxmox settings observed

Checked through the project automation path on **2026-05-12**.

| Setting | Value |
| --- | --- |
| VMID | 103 |
| Proxmox name | MlabUbuntuServ |
| Node | fmtagency |
| Type | qemu |
| Current state when checked | running |
| CPU cores | 8 |
| RAM allocation | 12.0 GB |
| Disk allocation | 100.0 GB |
| Runtime RAM used when checked | 3.5 GB (29.5%) |
| Runtime CPU used when checked | 0.10% |
| Uptime when checked | 8d 19h 52m |

## Setup guidance

### 1. Create or import the VM

In Proxmox:

1. Click **Create VM**.
2. Set VMID to `103`.
3. Set name to `MlabUbuntuServ`.
4. Select the matching OS installer or appliance image.
5. Use bridge networking, normally `vmbr0`, unless a later network design requires an isolated bridge.
6. Allocate resources to match the observed settings above.

### 2. Operating system expectation

Recommended/observed OS type for this role:

```text
Ubuntu Server
```

If exact installation media is unavailable, use the closest supported version and record the difference in this file.

### 3. Network configuration

- Attach the VM NIC to the Proxmox bridge used by the lab, normally `vmbr0`.
- Prefer DHCP during early setup unless the VM must have a fixed service address.
- If assigning a static IP, document it here and in any n8n/OpenClaw configuration that depends on it.
- Confirm the VM can reach the gateway and other required lab services.

### 4. Guest tools / access

- Install QEMU guest agent where supported.
- Enable SSH only when automation or administration needs it.
- Use key-based SSH for automation.
- Do not place private keys or passwords in this repository.

### 5. Automation registration

If this VM should be controlled by OpenClaw/n8n:

1. Add or update its entry in `config/vm-aliases.json`.
2. Include aliases that users naturally type.
3. Define only safe allowed actions.
4. Test read-only status first.
5. Enable state-changing actions only with confirmation.

## VM-specific notes

- Keep Docker, n8n, and related automation services documented here.
- Do not commit n8n API keys, credentials, or SSH private keys.


## Validation checklist

- [ ] VM appears in Proxmox with VMID `103`.
- [ ] VM name matches `MlabUbuntuServ`.
- [ ] CPU/RAM/disk match the documented allocation or the difference is recorded.
- [ ] Network adapter is attached to the correct bridge.
- [ ] VM boots successfully if it is expected to run.
- [ ] Required services for this VM's role are installed.
- [ ] SSH/API access is tested if automation needs it.
- [ ] OpenClaw/n8n status query can see the VM.

## Safety notes

- Use snapshots before major changes.
- Do not test destructive automation on important VMs.
- Keep credentials outside GitHub.
- Update this document whenever the VM resources, OS, or role changes.
