# Admin Network Operations Bot

## Scope of this subsection

This subsection documents the **Network Layer evaluation work** for the workflow **Admin Network Operations Bot**.

Following the Level 5 evaluation rules:

- this write-up documents **one member workflow path**, not the whole team project
- it focuses on the **workflow behaviour, scripts, test evidence points, and GNS3 lab context** used for this subsection
- it does **not** store secrets, API keys, bot tokens, SSH private keys, or licensed images.

## What this workflow is about

**Admin Network Operations Bot** is an administrator-facing **n8n + Telegram workflow** that supports:

1. **network case management**
2. **read-only network visibility tasks** such as showing VLANs and denied logs
3. **controlled network change tasks** such as VLAN creation and VLAN deletion
4. **router configuration backup** to the Ubuntu TFTP server in the GNS3 lab.

The workflow lets the administrator send natural-language or command-style Telegram messages, then routes them into deterministic n8n branches.

## Workflow JSON files included in this folder

This documentation folder now also includes the actual exported JSON workflows used in the implementation.

Location:

- `Workflow JSON/`

Included workflow exports:

- `Workflow JSON/Admin Network Operations Bot.json` - main workflow
- `Workflow JSON/show_vlans_workflow.json` - child workflow for VLAN inventory
- `Workflow JSON/vlans.json` - child workflow for VLAN create/delete operations
- `Workflow JSON/get_firewall_logs_users.json` - child workflow for denied-log retrieval
- `Workflow JSON/backup_router_config_workflow.json` - child workflow for router backup to TFTP

## Main workflow file used for this documentation

The local workflow evidence first used for this documentation was the later draft:

- `admin_network_operations_bot_1.after-backup-route.json`

That local draft was useful because it clearly showed the backup route addition. After that, the live n8n exports were also added under `Workflow JSON/` so the repository contains the actual workflow JSON set used for this evaluation subsection.

## High-level workflow design

### Trigger and intake

The workflow starts from a **Telegram Trigger** node, then standardizes the incoming message using **Prepare Message**.

The prepared fields include:

- `chat_id`
- `text`
- `user_id`
- `user_name`

### AI interpretation layer

The workflow uses **Admin AI Agent** to convert a Telegram message into a JSON action payload.

The supported actions in the documented workflow are:

- `show_open_cases`
- `show_cases_by_department`
- `view_case`
- `diagnose_case`
- `update_status`
- `resolve_case`
- `create_vlan`
- `delete_vlan`
- `show_vlans`
- `get_denied_logs`
- `backup_router_config`
- `help`

### Parsing and control logic

After AI output, **Parse Admin JSON**:

- cleans malformed JSON if needed
- maps aliases such as `resolve`, `update`, or `diagnose` to workflow actions
- extracts case IDs
- extracts VLAN ID / VLAN name
- extracts router backup parameters such as `R2`, `running`, `startup`, or `both`.

### Pending-approval guard

Before normal routing continues, the workflow reads the **admin_actions** Data Table and checks whether a **pending VLAN deletion approval** already exists.

This is handled by:

- `Read Admin Actions1`
- `Detect Delete Approval Reply`
- `Route Pending Approval`

This design prevents an administrator from ignoring a pending delete confirmation and accidentally mixing a risky operation with a new command.

## Functional branches documented in this workflow

### 1. Show open cases

Reads the `cases` Data Table, filters cases with status `Open`, and formats the list for Telegram.

### 2. Show cases by department

Reads the `cases` Data Table, filters by department, and returns the result to Telegram.

### 3. View one case

Reads case details and formats a single-case response with employee, department, email, service, issue type, status, and description.

### 4. Diagnose a case

Creates a structured **diagnostic plan** without making live network changes. The plan includes:

1. reachability checks
2. VLAN assignment checks
3. inter-VLAN routing checks
4. ACL / firewall checks
5. likely cause and recommendation summary.

The workflow also appends the generated plan to `diagnostic_logs`.

### 5. Update case status

Updates the selected case in the `cases` Data Table and returns a Telegram confirmation.

### 6. Resolve case and send email

Marks the case as `Resolved`, reloads the case row, prepares the resolution email, sends it through Gmail, and confirms the result to the administrator.

### 7. Show VLANs

This is a **direct read-only branch**.

The main workflow calls the child workflow:

- `show_vlans_workflow`

After the child workflow returns JSON, the code node `Code in JavaScript` reformats the result into a cleaner Telegram summary and hides Cisco legacy default VLANs `1002-1005` from the main display.

### 8. Create VLAN

This is a **direct write branch** in the documented version.

The main workflow calls the child workflow:

- `vlans`

Inputs passed to the child workflow:

- `action=create`
- `vlan_id`
- `vlan_name`

The workflow then sends the child workflow result back to Telegram.

### 9. Delete VLAN

This is the **protected write branch**.

Delete does **not** execute immediately.

Instead it:

1. prepares a pending delete record
2. appends that record to `admin_actions`
3. asks the administrator to reply `YES` or `NO`
4. only after approval, calls the child workflow `vlans` with `action=delete`.

This is the strongest built-in safety control in the workflow.

### 10. Get denied logs

This is a **direct read-only branch**.

The main workflow calls the child workflow:

- `get_firewall_logs_users`

The response is formatted into Telegram text showing user, destination, and status where available.

### 11. Backup router configuration

This branch calls the child workflow:

- `backup_router_config_workflow`

Inputs passed from the main workflow:

- `router_name` (default fallback in the workflow: `R2`)
- `config_type` (`running`, `startup`, or `both`)

The branch is meant to back up router configuration files from the GNS3 lab to the Ubuntu TFTP server.

## Data Tables used

The workflow depends on these n8n Data Tables:

| Data Table | Purpose |
| --- | --- |
| `cases` | stores employee network support cases |
| `admin_actions` | stores protected action approval history, especially delete-VLAN requests |
| `diagnostic_logs` | stores the generated troubleshooting plans |

## Main scripts used by this workflow

The extracted scripts are stored in `Script Code/`.

### n8n Code node logic

The main workflow contains custom JavaScript for:

- parsing AI output
- preserving case context across row-based Data Table branches
- formatting open cases, department cases, and single-case views
- generating the diagnostic plan
- handling delete approval logic
- formatting VLAN inventory output.

### Python VLAN automation script

The VLAN workflow uses a Python script documented here as:

- `Script Code/Python/vlan_manager.sanitized.py`

Based on the preserved local script evidence, its behaviour is:

- connect through a **FortiGate/jump path**
- reach the Cisco switch used for VLAN operations
- run `show vlan brief`
- for **create**, choose an eligible access port, create the VLAN, assign the port, and save the configuration
- for **delete**, move assigned ports back to VLAN 1, remove the VLAN, and save the configuration
- update the corresponding firewall-side VLAN interface
- return JSON back to n8n.

To comply with repository rules, the stored copy is sanitized and replaces all live credentials and addresses with placeholders.

## GNS3 project context used by this workflow

See `../GNS3 Network Documentation/README.md` for the detailed lab summary.

In short, the workflow evidence points to the GNS3 project:

- `Medium_Company_Network-1-89`

and a lab path involving:

- `R2` for router backup operations
- `IOU1` for VLAN operations
- `ubuntu_server-2` as the Ubuntu TFTP server host
- a firewall/jump path used by the VLAN Python automation script.

## Child workflow structure

The main workflow depends on four child workflows:

1. `show_vlans_workflow`
2. `vlans`
3. `get_firewall_logs_users`
4. `backup_router_config_workflow`

This means the n8n implementation is not just one standalone bot workflow. It is a small workflow group where the main admin bot acts as the router/orchestrator and the child workflows handle specific network tasks.

## Suggested evaluation evidence to collect

To satisfy Level 5 evaluation expectations, the following evidence should be added when final screenshots are available:

1. Telegram message that triggers the workflow
2. n8n execution path screenshot
3. Data Table row before/after update for case actions
4. delete-VLAN approval prompt screenshot
5. VLAN creation success screenshot
6. denied-logs output screenshot
7. backup-router result screenshot
8. GNS3 topology screenshot for `Medium_Company_Network-1-89`
9. device CLI evidence such as `show vlan brief` or router backup prompts
10. result summary table for pass/fail testing.

## Limitations and honesty note

- I could not live-query the GNS3 API at documentation time because the saved GNS3 API endpoint was unreachable during this session.
- For that reason, the GNS3 device summary in this subsection is based on **preserved project notes, script evidence, and workflow references**, not a fresh real-time topology pull.
- This is explicitly stated so the documentation stays accurate and academically honest.
