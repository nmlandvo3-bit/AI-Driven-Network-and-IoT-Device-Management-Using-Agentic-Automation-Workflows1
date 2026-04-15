# VM Alias Resolution Design

## Purpose

This file defines how natural-language VM references from Telegram/OpenClaw should be resolved into exact Proxmox targets.

The administrator should not need to remember VMIDs. Instead, OpenClaw resolves conversational names such as `GNS3 VM` or `Ubuntu desktop` into precise infrastructure identifiers.

## Current live VM inventory

Source: Proxmox `cluster/resources?type=vm`
Node: `fmtagency`

- VMID 102 -> `WinEleven`
- VMID 103 -> `MlabUbuntuServ`
- VMID 104 -> `GN3VM`
- VMID 105 -> `Ubuntu-Ollama-VM-25`
- VMID 106 -> `UbuntuDesk24.04`
- VMID 107 -> `GNS3-VM107`

## Resolution approach

### 1. Try exact canonical name
Example:
- `ubuntu-desktop-vm`

### 2. Try exact alias match
Example:
- `ubuntu desktop`
- `gns3 vm`

### 3. Try normalized alias match
Normalization should:
- lowercase text
- trim whitespace
- collapse repeated spaces
- remove punctuation where safe

This helps match inputs like:
- `Ubuntu Desktop`
- `ubuntu-desktop`
- `GNS3 VM`

### 4. Try partial match
Example:
- `ubuntu`
- `gns3`

If this returns more than one candidate, the system must not guess.

### 5. Clarify with admin
If multiple candidates are plausible, OpenClaw should ask the admin to choose.

Example:

> I found multiple possible matches for `gns3 vm`:
> - gns3-vm-primary (VMID 104, currently stopped)
> - gns3-vm-secondary (VMID 107, currently running)
> Which one do you mean?

### 6. If no match, suggest the nearest known aliases
Example:

> I couldn't match `ubuntu lab machine` to a known VM. Did you mean one of these:
> - mlab-ubuntu-server
> - ubuntu-ollama-vm
> - ubuntu-desktop-vm

## Safety rule

For state-changing actions, the system must never guess the target when resolution is ambiguous.

This applies to:
- start VM
- stop VM
- reboot VM
- update VM
- any future destructive action

## Recommended OpenClaw behavior

### For read-only requests
If ambiguity is low, OpenClaw may ask a follow-up question before calling n8n.

### For state-changing requests
OpenClaw must:
1. resolve the target
2. if ambiguous, ask for clarification
3. once resolved, ask for confirmation
4. only then call n8n

## Example flow

User:
- `help me restart gns3 vm`

OpenClaw:
1. match alias `gns3 vm`
2. resolve directly to the production GNS3 VM
3. identify target as `gns3-vm` (VMID 107)
4. ask for confirmation
5. send exact structured payload to n8n

If the user instead says `test gns3 vm` or `old gns3 vm`, OpenClaw should resolve that to VMID 104.

## Suggested structured payload after resolution

```json
{
  "intent": "restart_vm",
  "target_name": "gns3-vm",
  "target_alias_used": "gns3 vm",
  "vmid": "107",
  "node": "fmtagency",
  "platform": "proxmox",
  "confirm": true
}
```
