# Suggested Test Cases and Evidence Checklist

This file is a ready-to-use evaluation checklist for **Admin Network Operations Bot**.

## Documentation rule reminder

This repository subsection should contain:

- workflow documentation
- test cases
- screenshots/evidence references
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

| Scenario ID | Date tested | Example Input | Actual result | Pass/Fail | Evidence file / screenshot |
| --- | --- | --- | --- | --- | --- |
| NET-ADM-01 | 15/05/2026 | hello | Menu | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/1fe005554c2bdb73b00ec424aa688d8bce905e87/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Menu.png) |
| NET-ADM-02 | 15/05/2026 | show open cases | Open cases are listed | Pass |  |
| NET-ADM-03 | 15/05/2026 | show cases HR | Only HR cases are shown | Pass |  |
| NET-ADM-04 | 15/05/2026 | View one case	 | Full case detail is returned | Pass |  |
| NET-ADM-05 | 15/05/2026 | Diagnose a case | Diagnostic plan is returned and logged | Pass |  |
| NET-ADM-06 | 15/05/2026 | Update case status | Case status changes | Pass |  |
| NET-ADM-07 | 15/05/2026 | Resolve case | Case becomes resolved and email is sent | Pass |  |
| NET-ADM-08 | 15/05/2026 | Show VLANs | VLAN summary is returned  | Pass |  |
| NET-ADM-09 | 15/05/2026 | Create VLAN | VLAN is created and success message returns | Pass |  |
| NET-ADM-10 | 15/05/2026 | Delete VLAN approval prompt | Workflow creates pending approval record and asks for YES/NO | Pass |  |
| NET-ADM-11 | 15/05/2026 | Delete VLAN approved | VLAN delete | Pass |  |
| NET-ADM-12 | 15/05/2026 | Delete VLAN rejected | Delete is cancelled and no network change occurs | Pass |  |
| NET-ADM-13 | 15/05/2026 | Get firewall logs | Firewall/log summary is returned | Pass |  |
| NET-ADM-14 | 15/05/2026 | Backup router config | Backup child workflow stores config files to Ubuntu TFTP | Pass |  |
