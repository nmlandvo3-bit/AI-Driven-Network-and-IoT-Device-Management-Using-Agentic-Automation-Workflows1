# OpenClaw Telegram -> n8n bridge spec

## Goal

Make Telegram messages understandable by OpenClaw, then forward a normalized request to the already-working n8n webhook:

`http://192.168.0.152:5678/webhook/LDOfaQU10lYbt2Yy/webhook/openclaw-proxmox-orchestrator`

This document is intentionally realistic for the current setup. It does **not** assume a hidden OpenClaw runtime hook already exists for intercepting Telegram messages and auto-calling a local script.

---

## 1. Intent parsing contract

OpenClaw should normalize each admin message into exactly one of these intents:

- `list_vm_status`
- `get_vm_status`
- `get_all_vm_ips`
- `start_vm`
- `stop_vm`
- `reboot_vm`

### Required normalized fields

```json
{
  "intent": "get_vm_status",
  "raw_text": "check status of gns3 vm",
  "target_text": "gns3 vm",
  "target_required": true,
  "state_changing": false,
  "confidence": "high"
}
```

### Parsing rules

- `list_vm_status`: requests about all VMs, for example `list vm status`, `check status of vms`, `which vms are running`
- `get_vm_status`: requests about one VM, for example `status of gns3 vm`, `is ubuntu desktop running`
- `get_all_vm_ips`: requests for all IPs, for example `get all vm ips`, `show vm ip addresses`
- `start_vm`: requests to power on one VM
- `stop_vm`: requests to power off one VM
- `reboot_vm`: requests to restart one VM

### Out-of-scope for MVP

If the message does not cleanly map to one of the six intents, OpenClaw should reply with a short help message instead of guessing.

---

## 2. Alias resolution rules

Source of truth: `config/vm-aliases.json`

### Match order

1. exact canonical name
2. exact alias
3. normalized alias
4. partial alias
5. clarify with admin

### Normalization

Before matching:

- lowercase
- trim outer whitespace
- collapse repeated spaces
- treat hyphen and underscore as spaces
- remove safe punctuation

### Safety rules

- For `start_vm`, `stop_vm`, `reboot_vm`, never guess on ambiguous matches.
- For read-only requests, prefer clarification over guessing if more than one VM is plausible.
- If user gives a numeric VMID like `107`, resolve directly if it exists in the alias file.

### Resolution output contract

```json
{
  "matched": true,
  "target_text": "gns3 vm",
  "match_type": "exact_alias",
  "target": {
    "canonical_name": "gns3-vm",
    "vmid": "107",
    "node": "fmtagency",
    "proxmox_name": "GNS3-VM107"
  }
}
```

### Ambiguous result contract

```json
{
  "matched": false,
  "reason": "ambiguous",
  "target_text": "ubuntu",
  "candidates": [
    {"canonical_name": "mlab-ubuntu-server", "vmid": "103"},
    {"canonical_name": "ubuntu-ollama-vm", "vmid": "105"},
    {"canonical_name": "ubuntu-desktop-vm", "vmid": "106"}
  ]
}
```

---

## 3. Confirmation flow

### Read-only intents

These do **not** require confirmation:

- `list_vm_status`
- `get_vm_status`
- `get_all_vm_ips`

OpenClaw can call n8n immediately after successful parsing and resolution.

### State-changing intents

These **do** require confirmation:

- `start_vm`
- `stop_vm`
- `reboot_vm`

### Confirmation prompt format

Example:

> Confirm reboot of `gns3-vm` (VMID 107) on node `fmtagency`? Reply `yes` to continue or `cancel`.

### Confirmation state handling

Because no hidden persistent Telegram bridge is guaranteed yet, the MVP should use an explicit short-lived pending action record outside gateway config, for example:

- in-memory if implemented inside a running script/process, or
- a small local JSON file such as `tmp/openclaw-bridge-pending.json`

Pending record example:

```json
{
  "request_id": "req_20260415_001",
  "chat_id": "<telegram-chat-id>",
  "user_id": "<telegram-user-id>",
  "intent": "reboot_vm",
  "target": {
    "canonical_name": "gns3-vm",
    "vmid": "107",
    "node": "fmtagency"
  },
  "expires_at": "2026-04-15T12:45:00+08:00"
}
```

### Confirmation rules

- Only `yes`, `confirm`, or a project-defined equivalent should execute the pending action.
- `cancel` should delete the pending action and reply with cancellation.
- Expired pending actions must not run.
- Confirmation must match the same chat and same user that initiated the request.

---

## 4. Request payload shape sent to n8n

Base payload:

```json
{
  "source": "openclaw",
  "channel": "telegram",
  "request_id": "req_20260415_001",
  "user_id": "<sender-id>",
  "user_name": "<sender-name>",
  "chat_id": "<telegram-chat-id>",
  "raw_text": "reboot gns3 vm",
  "intent": "reboot_vm",
  "target": {
    "canonical_name": "gns3-vm",
    "vmid": "107",
    "node": "fmtagency",
    "proxmox_name": "GNS3-VM107",
    "alias_used": "gns3 vm"
  },
  "confirmed": true,
  "requires_confirmation": true
}
```

### Payload notes

- `target` should be `null` for `list_vm_status` and `get_all_vm_ips`.
- For `get_vm_status`, `start_vm`, `stop_vm`, `reboot_vm`, send a resolved `target` object.
- Keep `raw_text` for audit/debugging.
- `request_id` should be unique per user request, not reused across retries.

---

## 5. Reply formatting rules

OpenClaw should translate n8n JSON into concise Telegram-safe text.

### General rules

- Prefer plain text, short lines, no markdown tables.
- Keep first line outcome-focused.
- Mention VM canonical name and VMID for single-VM actions.
- If n8n returns a guard result like already running/stopped, surface that plainly.
- If alias clarification is needed, do not call n8n yet.

### Suggested reply shapes

#### list_vm_status

```text
VM status summary:
- 103 mlab-ubuntu-server: running
- 106 ubuntu-desktop-vm: running
- 107 gns3-vm: running
- 102 windows-11-vm: stopped
- 104 gns3-vm-test: stopped
- 105 ubuntu-ollama-vm: stopped
```

#### get_vm_status

```text
`gns3-vm` (VMID 107) is running.
```

#### get_all_vm_ips

```text
VM IPs:
- 103 mlab-ubuntu-server: 192.168.x.x
- 106 ubuntu-desktop-vm: 192.168.x.x
- 107 gns3-vm: 192.168.x.x
```

#### state-changing success

```text
Reboot started for `gns3-vm` (VMID 107).
```

#### guard response

```text
`windows-11-vm` (VMID 102) is already stopped, so no action was taken.
```

#### clarification

```text
I found multiple matches for `ubuntu`:
- mlab-ubuntu-server (103)
- ubuntu-ollama-vm (105)
- ubuntu-desktop-vm (106)
Reply with the exact VM name or VMID.
```

#### unsupported message

```text
I can help with: list VM status, check one VM status, get all VM IPs, start VM, stop VM, reboot VM.
```

---

## 6. Realistic execution in the current OpenClaw setup

## What can be automated now

1. OpenClaw can already reason over a Telegram message when that message reaches an active OpenClaw chat.
2. OpenClaw can parse intent, resolve aliases from `config/vm-aliases.json`, and decide whether confirmation is required.
3. OpenClaw can call the n8n webhook using a local script or `curl` from the workspace.
4. OpenClaw can format the JSON result into a Telegram-friendly reply.

## What is still manual or missing

1. There is **not yet a confirmed always-on OpenClaw runtime bridge** that automatically intercepts every Telegram bot message and runs this exact parser/webhook pipeline without further setup.
2. Pending confirmation state across Telegram turns is **not yet implemented** as a checked-in bridge process.
3. Telegram bot wiring into OpenClaw still depends on the broader OpenClaw Telegram setup being present and working end to end.
4. No gateway config changes were made here.

## Practical MVP execution options

### Option A, best immediate test path

Run the bridge logic manually from the OpenClaw session or a local helper script:

- paste a simulated Telegram message into OpenClaw
- let OpenClaw normalize it
- on confirmed requests, POST to the n8n webhook
- read back the result

This is the most realistic current-session path because it does not depend on unverified hidden runtime hooks.

### Option B, small local helper script

Create a workspace script later, for example `scripts/openclaw_n8n_bridge.py` or `.js`, that:

- accepts `raw_text`, `user_id`, `user_name`, `chat_id`
- loads `config/vm-aliases.json`
- outputs either clarification, confirmation prompt, or webhook response text

OpenClaw can call that script with `exec` once it exists.

---

## 7. Concrete current-session test method

A real test can be done **right now** without changing gateway config:

### Read-only test

Input message:

`check status of gns3 vm`

Expected OpenClaw bridge result before POST:

```json
{
  "intent": "get_vm_status",
  "target": {
    "canonical_name": "gns3-vm",
    "vmid": "107",
    "node": "fmtagency",
    "alias_used": "gns3 vm"
  },
  "confirmed": false,
  "requires_confirmation": false
}
```

Then POST that normalized payload to the n8n webhook and format the reply.

### State-changing test

Input message:

`reboot test gns3 vm`

Expected behavior:

1. resolve to `gns3-vm-test` / VMID `104`
2. do **not** call n8n yet
3. return confirmation prompt
4. only after explicit `yes`, send webhook payload with `confirmed: true`

This is safe because VM 104 was documented as the test/unused GNS3 VM.

---

## 8. Recommended next implementation step

Build a tiny checked-in local bridge script that implements exactly this contract and can be called by OpenClaw with `exec`. That gives a truthful MVP now, while leaving full Telegram auto-ingest as a later integration step.
