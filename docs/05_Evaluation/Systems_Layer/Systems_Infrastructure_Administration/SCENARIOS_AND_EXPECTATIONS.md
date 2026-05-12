# Systems Infrastructure and Administration — Scenarios and Expectations

## Purpose

This document defines the evaluation scenarios for the Systems Infrastructure and Administration part of the project. These scenarios explain what the workflow should do, what the expected result is, and what evidence should be collected when testing.

## Workflow under evaluation

Main workflow:

```text
Proxmox Admin Bot
```

Called sub-workflow chain:

```text
Proxmox Admin Bot
└── OpenClaw Proxmox Orchestrator
    ├── Sub-Proxmox-IP-Resolver
    ├── Sub-Proxmox-Resource-Diagnostics
    ├── Sub-Proxmox-Snapshot-Manager
    ├── Sub-Proxmox-Safe-Patching
    ├── Sub-Proxmox-Ghost-VM-Recovery
    └── Sub-Proxmox-Idle-Lab-Cleanup
```

## General expectations for all scenarios

Every scenario should satisfy these expectations:

1. The admin can trigger the scenario from the bot/chat interface or from a controlled test input.
2. The workflow identifies the requested action correctly.
3. The workflow targets the correct VM or asks for clarification when the target is unclear.
4. Read-only operations execute without unnecessary confirmation.
5. State-changing operations require confirmation before execution.
6. The result returned to the admin is clear and short.
7. n8n execution history shows the path taken through the workflow.
8. No credentials, private keys, tokens, or passwords are exposed in the response or documentation.

## Scenario summary table

| ID | Scenario | Risk level | Main expected result |
| --- | --- | --- | --- |
| SYS-01 | Help and command discovery | Low | Bot explains supported systems commands. |
| SYS-02 | List all VMs | Low | Bot returns VM inventory and statuses. |
| SYS-03 | Check single VM status | Low | Bot returns the selected VM state. |
| SYS-04 | Get all VM IP addresses | Low | Bot resolves reachable VM IPs and marks stopped/unresolved VMs clearly. |
| SYS-05 | Start a VM | Medium | Bot starts VM only after validation/confirmation path. |
| SYS-06 | Stop a VM | High | Bot stops VM only after validation/confirmation path. |
| SYS-07 | Reboot a VM | High | Bot reboots only a running VM and only after validation/confirmation path. |
| SYS-08 | Guard condition: already running/stopped/not running | Low/Medium | Bot refuses unnecessary or invalid actions and explains why. |
| SYS-09 | Resource diagnostics | Low | Bot collects CPU/RAM/disk/service indicators and summarizes health. |
| SYS-10 | Create safety snapshot | Medium | Bot creates a Proxmox snapshot for the target VM and reports snapshot result. |
| SYS-11 | Safe patching | High | Bot requires approval, creates safety snapshot, applies updates, and reports result. |
| SYS-12 | Ghost VM / service unreachable recovery | Medium/High | Bot diagnoses a VM that is running but unreachable and recommends or performs safe recovery steps. |
| SYS-13 | Idle lab cleanup recommendation | Low/Medium | Bot identifies idle/stopped/resource-heavy VMs and suggests cleanup actions. |
| SYS-14 | Unknown or ambiguous request | Low | Bot does not guess; it asks for clarification or shows supported commands. |

---

## SYS-01 — Help and command discovery

### Goal

Confirm that an admin can discover available systems administration commands.

### Example input

```text
help
```

### Expected workflow path

```text
Proxmox Admin Bot → help/list command branch
```

### Expected output

The bot should return a short help message showing supported commands, for example:

- list VMs;
- check VM status;
- start VM;
- stop VM;
- reboot VM;
- check updates;
- update/patching-related commands;
- newer natural-language systems requests.

### Evidence to collect

- screenshot of command input;
- screenshot of bot response;
- n8n execution showing the help branch.

---

## SYS-02 — List all VMs

### Goal

Confirm that the workflow can retrieve the current VM inventory from Proxmox.

### Example inputs

```text
list vms
check status of vms
show vms
```

### Expected workflow path

```text
Proxmox Admin Bot
→ Proxmox API cluster/resources query
→ VM list formatting node
→ Telegram/admin response
```

For natural-language requests, the path may route through:

```text
Proxmox Admin Bot
→ OpenClaw Proxmox Orchestrator
→ list_vm_status branch
```

### Expected output

The bot should list VMs with at least:

- VMID;
- VM name;
- node;
- running/stopped state.

### Expected current inventory

The documented lab inventory includes:

| VMID | Name | Expected role |
| --- | --- | --- |
| 100 | IOT-CORE | IoT core services |
| 102 | WinEleven | Windows endpoint |
| 103 | MlabUbuntuServ | Ubuntu server / automation stack |
| 104 | GN3VM | test/older GNS3 VM |
| 105 | UbuntuTest | Ubuntu test endpoint |
| 106 | UbuntuDesk24.04 | Ubuntu desktop workstation |
| 107 | GNS3-VM107 | production GNS3 backend |

### Evidence to collect

- bot response;
- n8n execution path;
- Proxmox VM list screenshot or exported result.

---

## SYS-03 — Check single VM status

### Goal

Confirm that the workflow can retrieve status for one specific VM.

### Example inputs

```text
status vm 107
check status of gns3 vm
is Ubuntu Test running
```

### Expected workflow path

```text
Proxmox Admin Bot
→ VMID/target parsing
→ Proxmox API cluster/resources query
→ VM validation/formatting
→ response
```

For natural-language commands:

```text
Proxmox Admin Bot
→ OpenClaw Proxmox Orchestrator
→ get_vm_status branch
```

### Expected output

The bot should return the VM name, VMID, node, and status.

Example:

```text
GNS3-VM107 (VMID 107) is running.
```

### Evidence to collect

- input command;
- response;
- workflow execution showing the selected VMID.

---

## SYS-04 — Get all VM IP addresses

### Goal

Confirm that the workflow can resolve VM IP addresses without relying on QEMU Guest Agent.

### Example inputs

```text
get all vm ips
show ip addresses of all machines
```

### Expected workflow path

```text
Proxmox Admin Bot
→ OpenClaw Proxmox Orchestrator
→ Sub-Proxmox-IP-Resolver
→ SSH command on Proxmox
→ parse resolver output
→ response
```

### Script/command involved

See:

```text
Scripts Code/SSH Commands/03-sub-proxmox-ip-resolver__04-ssh-resolve-vm-ip-from-proxmox.sh
```

### Expected output

The bot should return a list of VMs and IP results:

- running VMs should show IP addresses when discoverable;
- stopped VMs should be marked as stopped or not running;
- unresolved VMs should be marked clearly instead of silently missing.

### Evidence to collect

- bot response;
- resolver workflow execution;
- extracted script reference;
- comparison with Proxmox/neighbor table if needed.

---

## SYS-05 — Start a VM

### Goal

Confirm that the workflow can safely start a stopped VM.

### Example input

```text
start vm 104
```

### Expected workflow path

```text
Proxmox Admin Bot
→ parse command
→ validate VMID
→ check current state
→ Proxmox start API call
→ response
```

### Expected output

If the VM is stopped, the bot should report that the start request was sent successfully.

If the VM is already running, the bot should not call start again and should return a guard message.

### Safety expectation

Use a safe test VM where possible, for example VM `104`.

### Evidence to collect

- before/after VM state;
- bot response;
- Proxmox task or n8n execution record.

---

## SYS-06 — Stop a VM

### Goal

Confirm that the workflow can stop a VM safely and does not stop the wrong target.

### Example input

```text
stop vm 104
```

### Expected workflow path

```text
Proxmox Admin Bot
→ parse command
→ validate VMID
→ check current state
→ Proxmox stop API call
→ response
```

### Expected output

If the VM is running, the bot should report that the stop request was sent.

If the VM is already stopped, the bot should return a guard response.

### Safety expectation

Do not test stopping production or important VMs unless the lab owner approves.

### Evidence to collect

- VM selected;
- confirmation/guard behavior if present;
- Proxmox task result;
- final VM state.

---

## SYS-07 — Reboot a VM

### Goal

Confirm that the workflow only reboots valid running VMs.

### Example input

```text
reboot vm 107
```

### Expected workflow path

```text
Proxmox Admin Bot
→ parse command
→ validate VMID
→ check VM is running
→ Proxmox reboot API call
→ response
```

### Expected output

If the VM is running, the bot reports that reboot was initiated.

If the VM is stopped, the bot should refuse and explain that the VM must be running to reboot.

### Safety expectation

Avoid rebooting VM `107` during active GNS3 work unless approved.

### Evidence to collect

- command;
- guard/approval behavior;
- Proxmox task result;
- VM uptime or status after reboot.

---

## SYS-08 — Guard conditions

### Goal

Confirm that invalid or unnecessary actions are blocked safely.

### Example inputs

```text
start vm 107
stop vm 102
reboot vm 102
```

### Expected results

| Case | Expected behavior |
| --- | --- |
| Start already-running VM | Bot says VM is already running. |
| Stop already-stopped VM | Bot says VM is already stopped. |
| Reboot stopped VM | Bot says VM must be running before reboot. |
| Unknown VMID | Bot says VM was not found. |

### Evidence to collect

- bot response for each guard case;
- n8n execution showing no unsafe action was called.

---

## SYS-09 — Resource diagnostics

### Goal

Confirm that the system can diagnose VM resource usage and summarize health.

### Example inputs

```text
Ubuntu Test is slow
diagnose vm 105
check CPU and RAM of Ubuntu Test
```

### Expected workflow path

```text
Proxmox Admin Bot
→ OpenClaw Proxmox Orchestrator
→ Sub-Proxmox-Resource-Diagnostics
→ SSH: Collect Proxmox Metrics
→ optional SSH: Guest OS Diagnostics
→ response
```

### Scripts/commands involved

```text
Scripts Code/SSH Commands/04-sub-proxmox-resource-diagnostics__04-ssh-collect-proxmox-metrics.sh
Scripts Code/SSH Commands/04-sub-proxmox-resource-diagnostics__06-ssh-guest-os-diagnostics.sh
```

### Expected output

The bot should summarize indicators such as:

- CPU usage;
- memory usage;
- disk usage;
- uptime or running state;
- guest OS indicators where available;
- recommendation or next step.

### Evidence to collect

- bot response;
- Proxmox metrics;
- guest diagnostics output if used;
- workflow execution record.

---

## SYS-10 — Create safety snapshot

### Goal

Confirm that the workflow can create a Proxmox snapshot before risky work.

### Example input

```text
create snapshot of Ubuntu Test
```

### Expected workflow path

```text
Proxmox Admin Bot
→ OpenClaw Proxmox Orchestrator
→ Sub-Proxmox-Snapshot-Manager
→ SSH: Snapshot Manager
→ response
```

### Script/command involved

```text
Scripts Code/SSH Commands/05-sub-proxmox-snapshot-manager__04-ssh-snapshot-manager.sh
```

### Expected output

The bot should report:

- target VM;
- snapshot name or ID;
- success/failure status;
- any Proxmox error if snapshot creation fails.

### Evidence to collect

- bot response;
- Proxmox snapshot list showing the new snapshot;
- n8n execution result.

---

## SYS-11 — Safe patching

### Goal

Confirm the safety-first update workflow for a Linux VM.

### Example input

```text
safely update Ubuntu Test
```

### Expected workflow path

```text
Proxmox Admin Bot
→ OpenClaw Proxmox Orchestrator
→ Sub-Proxmox-Safe-Patching
→ confirmation gate
→ Sub-Proxmox-Snapshot-Manager
→ SSH: Patch Ubuntu Test
→ format result
```

### Script/command involved

```text
Scripts Code/SSH Commands/06-sub-proxmox-safe-patching__07-ssh-patch-ubuntu-test.sh
```

### Expected behavior

The workflow should:

1. identify the correct VM;
2. require approval/confirmation before patching;
3. create a safety snapshot;
4. run package update commands through SSH;
5. return a summary of updated packages or result status;
6. provide rollback guidance if the patch fails.

### Evidence to collect

- confirmation message;
- snapshot result;
- patch execution output;
- final bot response;
- before/after package or service status if available.

---

## SYS-12 — Ghost VM / service unreachable recovery

### Goal

Confirm that the workflow can handle a VM that appears to be running but a service or user access is failing.

### Example inputs

```text
People cannot access Ubuntu Test
Ubuntu Test is unreachable
app is down on Ubuntu Test
```

### Expected workflow path

```text
Proxmox Admin Bot
→ OpenClaw Proxmox Orchestrator
→ Sub-Proxmox-Ghost-VM-Recovery
→ Sub-Proxmox-IP-Resolver
→ recovery advice formatting
```

### Expected output

The bot should provide a recovery-oriented summary such as:

- VM is running or not running;
- IP address if found;
- likely access/service issue;
- recommended next step;
- whether escalation to reboot or service restart is needed.

### Safety expectation

The workflow should prefer diagnosis and advice before destructive actions. Reboot/reset should require approval.

### Evidence to collect

- input issue report;
- bot diagnosis;
- workflow path;
- any service/IP evidence used.

---

## SYS-13 — Idle lab cleanup recommendation

### Goal

Confirm that the workflow can identify VMs that may be idle or safe cleanup candidates.

### Example inputs

```text
find idle VMs and suggest cleanup
cleanup idle vms
show unused vms
```

### Expected workflow path

```text
Proxmox Admin Bot
→ OpenClaw Proxmox Orchestrator
→ Sub-Proxmox-Idle-Lab-Cleanup
→ analyze idle candidates
→ response
```

### Expected output

The bot should produce a recommendation list, not immediately delete or stop resources without approval.

Expected details:

- VMID and VM name;
- current state;
- resource allocation;
- reason it may be a cleanup candidate;
- recommended action.

### Evidence to collect

- recommendation response;
- n8n execution;
- Proxmox inventory used for analysis.

---

## SYS-14 — Unknown or ambiguous request

### Goal

Confirm that the system fails safely when it cannot understand or cannot safely target a VM.

### Example inputs

```text
fix the server
status of ubuntu
reboot the machine
```

### Expected behavior

The bot should not guess. It should either:

- ask the user to clarify the VM;
- list possible VM candidates;
- show supported commands.

### Evidence to collect

- ambiguous input;
- clarification response;
- proof that no state-changing action executed.

---

## Evaluation evidence checklist

For each tested scenario, collect:

- [ ] scenario ID;
- [ ] date/time tested;
- [ ] input command/message;
- [ ] expected behavior;
- [ ] actual behavior;
- [ ] pass/fail result;
- [ ] screenshot of bot/admin response;
- [ ] n8n execution screenshot or execution ID;
- [ ] Proxmox screenshot/output if relevant;
- [ ] script or workflow node references;
- [ ] notes/limitations.

## Suggested results table template

| Scenario ID | Input | Expected result | Actual result | Pass/Fail | Evidence link/screenshot |
| --- | --- | --- | --- | --- | --- |
| SYS-01 | `help` | Bot shows supported commands |  |  |  |
| SYS-02 | `list vms` | Bot lists all VMs |  |  |  |
| SYS-03 | `status vm 107` | Bot returns VM 107 status |  |  |  |
| SYS-04 | `get all vm ips` | Bot returns VM IP summary |  |  |  |
| SYS-05 | `start vm 104` | Bot starts/guards VM 104 |  |  |  |
| SYS-06 | `stop vm 104` | Bot stops/guards VM 104 |  |  |  |
| SYS-07 | `reboot vm 107` | Bot reboots/guards VM 107 |  |  |  |
| SYS-08 | guard test | Bot blocks invalid action |  |  |  |
| SYS-09 | `Ubuntu Test is slow` | Bot returns diagnostics |  |  |  |
| SYS-10 | `create snapshot of Ubuntu Test` | Bot creates snapshot |  |  |  |
| SYS-11 | `safely update Ubuntu Test` | Bot confirms, snapshots, patches |  |  |  |
| SYS-12 | `People cannot access Ubuntu Test` | Bot diagnoses unreachable service/VM |  |  |  |
| SYS-13 | `cleanup idle vms` | Bot suggests cleanup candidates |  |  |  |
| SYS-14 | ambiguous request | Bot asks clarification |  |  |  |
