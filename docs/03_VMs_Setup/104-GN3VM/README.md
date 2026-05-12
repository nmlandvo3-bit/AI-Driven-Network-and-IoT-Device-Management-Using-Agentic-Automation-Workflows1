# VM 104 — GN3VM

## Role in the project

**Canonical documentation name:** `gns3-vm-test`  
**Role:** Test or older GNS3 VM  
**Purpose:** Safe test target for GNS3-related experiments without touching the production GNS3 VM.

## Actual Proxmox settings observed

Checked through the project automation path on **2026-05-12**.

| Setting | Value |
| --- | --- |
| VMID | 104 |
| Proxmox name | GN3VM |
| Node | fmtagency |
| Type | qemu |
| Current state when checked | stopped |
| CPU cores | 6 |
| RAM allocation | 12.0 GB |
| Disk allocation | 19.5 GB |
| Runtime RAM used when checked | 0 GB (0.0%) |
| Runtime CPU used when checked | 0.00% |
| Uptime when checked | - |

## Setup guidance

### 1. Create or import the VM

In Proxmox:

1. Click **Create VM**.
2. Set VMID to `104`.
3. Set name to `GN3VM`.
4. Select the matching OS installer or appliance image.
5. Use bridge networking, normally `vmbr0`, unless a later network design requires an isolated bridge.
6. Allocate resources to match the observed settings above.

### 2. Operating system expectation

Recommended/observed OS type for this role:

```text
GNS3 VM appliance / Ubuntu-based image
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

- Currently stopped.
- Use this VM for risky GNS3 tests when possible.


## Validation checklist

- [ ] VM appears in Proxmox with VMID `104`.
- [ ] VM name matches `GN3VM`.
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
