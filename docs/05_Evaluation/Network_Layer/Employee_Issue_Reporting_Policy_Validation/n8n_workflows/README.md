# n8n Workflows

## Purpose of this folder

This folder stores the exported n8n workflow JSON files used by the **Employee Issue Reporting Policy Validation** subsection.

## Workflow export table

| Workflow export | Role |
| --- | --- |
| `Employee_Network_Case_Logging.workflow.json` | Main employee issue reporting and policy-validation workflow |
| `get_firewall_rules_workflow.workflow.json` | Supporting workflow that retrieves firewall policy/rule evidence |
| `get_acl_list.workflow.json` | Supporting workflow that retrieves router ACL evidence |

## Workflow roles

### Employee Network Case Logging

This main workflow receives Telegram issue reports, classifies the issue, validates policy evidence, requests identity details if needed, and builds/logs case records.

### get_firewall_rules_workflow

This supporting workflow retrieves firewall policy/rule evidence used during policy validation.

### get_acl_list

This supporting workflow retrieves router ACL evidence used during policy validation.

## Workflow call chain

```text
Employee Telegram Message
→ Employee Network Case Logging
→ Policy classification
→ get_firewall_rules_workflow
→ get_acl_list
→ Validate policy decision
→ Explain restriction / continue diagnostics / request clarification / log case
```

## Import instructions for n8n

1. Open n8n
2. Choose the import workflow option
3. Import the desired workflow from the JSON file in this folder
