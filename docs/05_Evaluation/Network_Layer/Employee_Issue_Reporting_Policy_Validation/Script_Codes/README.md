# Script Codes

## Purpose of this folder

This folder stores the extracted implementation logic used by the **Employee Issue Reporting Policy Validation** subsection.

It separates reusable Python automation from JavaScript logic that originally lived inside n8n Code nodes.

## Python automation scripts vs n8n Code nodes

- **Python automation scripts** are standalone scripts used by supporting workflows to retrieve live policy evidence from network devices
- **n8n Code nodes** are inline JavaScript blocks embedded in workflow nodes to normalize data, parse AI output, build records, and validate decisions inside n8n

## Folder structure

| Path | Purpose |
| --- | --- |
| `Python_Automation_Scripts/` | Python scripts used by supporting policy-evidence workflows |
| `Code_Nodes/` | Extracted JavaScript from n8n Code nodes |

## Files in this folder

| File | Type | Role |
| --- | --- | --- |
| `Python_Automation_Scripts/show_policies.py` | Python | Retrieves firewall policy/rule evidence |
| `Python_Automation_Scripts/get_acl_list.py` | Python | Retrieves router ACL evidence |
| `Code_Nodes/Employee_Network_Case_Logging__Extract_Telegram_Message.js` | n8n Code node | Extracts normalized Telegram message fields |
| `Code_Nodes/Employee_Network_Case_Logging__Parse_AI_Output.js` | n8n Code node | Parses AI classification output |
| `Code_Nodes/Employee_Network_Case_Logging__Build_Policy_Snapshot_Topology.js` | n8n Code node | Builds policy/topology context used in validation |
| `Code_Nodes/Employee_Network_Case_Logging__Validate_policy_decision.js` | n8n Code node | Produces the final policy/issue decision |
| `Code_Nodes/Employee_Network_Case_Logging__Extract_Contact_Details.js` | n8n Code node | Extracts employee contact/identity details |
| `Code_Nodes/Employee_Network_Case_Logging__Check_Identity_Complete.js` | n8n Code node | Checks whether case logging prerequisites are complete |
| `Code_Nodes/Employee_Network_Case_Logging__Build_Case_Record.js` | n8n Code node | Builds the case record payload |
| `Code_Nodes/get_firewall_rules_workflow__Get_Firewall_Rules.js` | n8n Code node | Formats firewall-rule evidence output |
| `Code_Nodes/get_acl_list__Get_ACL_List.js` | n8n Code node | Formats ACL evidence output |

## How the code nodes were extracted

The JavaScript files in `Code_Nodes/` were extracted directly from the live n8n workflow exports.

For each extracted file:

- the original JavaScript logic was preserved
- a short header comment was added with workflow name, node name, source, and purpose
- the extracted file name was made descriptive so the original workflow and node can be identified quickly in GitHub

## Safety note

The Python files were copied from the local environment with the **operational logic preserved**, but any live credential values were replaced with placeholders before storing them in the repository.
