# Suggested Test Cases and Evidence Checklist

This file is a ready-to-use evaluation checklist for **Admin Network Operations Bot**.

## Documentation rule reminder

This repository subsection should contain:

- workflow documentation;
- test cases;
- screenshots/evidence references;
- scripts used in the evaluation.

It should **not** contain secrets.

## Test case table

| ID | Scenario | Example input | Expected result | Evidence to capture |
| --- | --- | --- | --- | --- |
| NET-ADM-01 | Show open cases | `show open cases` | Open cases are listed from the `cases` Data Table | Telegram output + n8n run |
| NET-ADM-02 | Show department cases | `show cases Finance` | Only Finance cases are shown | Telegram output + n8n run |
| NET-ADM-03 | View one case | `view CASE-...` | Full case detail is returned | Telegram output + case row |
| NET-ADM-04 | Diagnose a case | `diagnose CASE-...` | Diagnostic plan is returned and logged | Telegram output + `diagnostic_logs` row |
| NET-ADM-05 | Update case status | `update CASE-... status In Progress` | Case status changes in the Data Table | Telegram output + before/after row |
| NET-ADM-06 | Resolve case | `resolve CASE-... restored access` | Case becomes resolved and email branch runs | Telegram output + email evidence |
| NET-ADM-07 | Show VLANs | `show vlans` | VLAN summary is returned from the child workflow | Telegram output + n8n child workflow run |
| NET-ADM-08 | Create VLAN | `create vlan 125 HUMANITIES` | VLAN is created and success message returns | Telegram output + switch evidence |
| NET-ADM-09 | Delete VLAN approval prompt | `delete vlan 125` | Workflow creates pending approval record and asks for YES/NO | Telegram output + `admin_actions` row |
| NET-ADM-10 | Delete VLAN approved | `YES` after pending delete | VLAN delete child workflow runs | Telegram output + switch evidence |
| NET-ADM-11 | Delete VLAN rejected | `NO` after pending delete | Delete is cancelled and no network change occurs | Telegram output + `admin_actions` update |
| NET-ADM-12 | Get denied logs | `get denied logs` | Firewall/log summary is returned | Telegram output + n8n child workflow run |
| NET-ADM-13 | Backup router config | `backup R2 both` | Backup child workflow stores config files to Ubuntu TFTP | Telegram output + TFTP file evidence |
| NET-ADM-14 | Help / fallback | `hello` or unclear text | Workflow returns supported-action guidance | Telegram output |

## Screenshot checklist

- [ ] Telegram trigger message
- [ ] AI-parsed / routed n8n execution
- [ ] `cases` Data Table screenshot
- [ ] `admin_actions` Data Table screenshot
- [ ] `diagnostic_logs` Data Table screenshot
- [ ] delete approval prompt
- [ ] create-VLAN result
- [ ] delete-VLAN result
- [ ] denied-logs result
- [ ] backup-router result
- [ ] GNS3 topology screenshot
- [ ] switch CLI screenshot (`show vlan brief` or related)
- [ ] router TFTP backup screenshot
- [ ] Ubuntu TFTP file screenshot

## Result recording template

| Scenario ID | Date tested | Expected result | Actual result | Pass/Fail | Evidence file / screenshot |
| --- | --- | --- | --- | --- | --- |
| NET-ADM-01 |  |  |  |  |  |
| NET-ADM-02 |  |  |  |  |  |
| NET-ADM-03 |  |  |  |  |  |
| NET-ADM-04 |  |  |  |  |  |
| NET-ADM-05 |  |  |  |  |  |
| NET-ADM-06 |  |  |  |  |  |
| NET-ADM-07 |  |  |  |  |  |
| NET-ADM-08 |  |  |  |  |  |
| NET-ADM-09 |  |  |  |  |  |
| NET-ADM-10 |  |  |  |  |  |
| NET-ADM-11 |  |  |  |  |  |
| NET-ADM-12 |  |  |  |  |  |
| NET-ADM-13 |  |  |  |  |  |
| NET-ADM-14 |  |  |  |  |  |
