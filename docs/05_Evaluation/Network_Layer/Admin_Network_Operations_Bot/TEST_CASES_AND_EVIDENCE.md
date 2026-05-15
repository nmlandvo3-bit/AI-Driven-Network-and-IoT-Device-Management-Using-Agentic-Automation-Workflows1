# Test Cases and Evidence Results

This file is a ready-to-use evaluation checklist for **Admin Network Operations Bot**.

## Documentation rule reminder

This repository subsection should contains:

- workflow documentation
- test cases
- screenshots/evidence references
- scripts used in the evaluation.

It does **not** contain secrets.

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

## Result recording template

| Scenario ID | Date tested | Example Input | Actual result | Pass/Fail | Evidence file / screenshot |
| --- | --- | --- | --- | --- | --- |
| NET-ADM-01 | 15/05/2026 | hello | Menu | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/1fe005554c2bdb73b00ec424aa688d8bce905e87/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Menu.png) |
| NET-ADM-02 | 15/05/2026 | show open cases | Open cases are listed | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/bf5855692edf97619155d9e4a50a93b158dc56e1/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/show%20open%20cases.png) |
| NET-ADM-03 | 15/05/2026 | show cases HR | Only HR cases are shown | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ef0c3d57c15b020cbe0c6ef38cf90a5a347495ed/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/HR%20cases.png) |
| NET-ADM-04 | 15/05/2026 | View one case	 | Full case detail is returned | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ef0c3d57c15b020cbe0c6ef38cf90a5a347495ed/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/View%20Case.png) |
| NET-ADM-05 | 15/05/2026 | Diagnose a case | Diagnostic plan is returned and logged | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ef0c3d57c15b020cbe0c6ef38cf90a5a347495ed/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Diagnose.png) |
| NET-ADM-06 | 15/05/2026 | Update case status | Case status changes | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ef0c3d57c15b020cbe0c6ef38cf90a5a347495ed/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Inprogress.png) |
| NET-ADM-07 | 15/05/2026 | Resolve case | Case becomes resolved and email is sent | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ef0c3d57c15b020cbe0c6ef38cf90a5a347495ed/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Resolve%20Case.png) |
| NET-ADM-08 | 15/05/2026 | Show VLANs | VLAN summary is returned  | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ef0c3d57c15b020cbe0c6ef38cf90a5a347495ed/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Show%20Vlans.png) |
| NET-ADM-09 | 15/05/2026 | Create VLAN | VLAN is created and success message returns | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ed4aa19072203d0233b355c9bf57c2ca215c6af3/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Create%20Vlan.png) |
| NET-ADM-10 | 15/05/2026 | Delete VLAN approval prompt | Workflow creates pending approval record and asks for YES/NO | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ed4aa19072203d0233b355c9bf57c2ca215c6af3/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Delete%20Request.png) |
| NET-ADM-11 | 15/05/2026 | Delete VLAN approved | VLAN delete | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ed4aa19072203d0233b355c9bf57c2ca215c6af3/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Delete%20Approved.png) |
| NET-ADM-12 | 15/05/2026 | Delete VLAN rejected | Delete is cancelled and no network change occurs | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ed4aa19072203d0233b355c9bf57c2ca215c6af3/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Delete%20Cancelled.png) |
| NET-ADM-13 | 15/05/2026 | Get firewall logs | Firewall/log summary is returned | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ed4aa19072203d0233b355c9bf57c2ca215c6af3/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Firewall%20logs.png) |
| NET-ADM-14 | 15/05/2026 | Backup router config | Backup child workflow stores config files to Ubuntu TFTP | Pass | ![image alt](https://github.com/hualiguide/MLAB-Project/blob/ed4aa19072203d0233b355c9bf57c2ca215c6af3/docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Screenshots/Backup%20R2.png) |
