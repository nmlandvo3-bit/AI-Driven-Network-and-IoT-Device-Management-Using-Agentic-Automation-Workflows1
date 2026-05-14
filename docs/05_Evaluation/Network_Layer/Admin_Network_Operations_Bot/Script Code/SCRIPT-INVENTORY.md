# Script Inventory

This folder stores extracted script logic for **Admin Network Operations Bot 1**.

## Code Nodes

| File | Source node | Purpose |
| --- | --- | --- |
| `Code Nodes/01-parse-admin-json.js` | `Parse Admin JSON` | Cleans AI output, applies intent aliases, extracts case IDs, VLAN values, and backup-router parameters. |
| `Code Nodes/02-resolve-approval-reply.js` | `Resolve Approval Reply` | Converts `YES/NO` delete approval replies into a short workflow result message. |
| `Code Nodes/03-format-open-cases.js` | `Format Open Cases` | Builds Telegram output for open network support cases. |
| `Code Nodes/04-format-department-cases.js` | `Format Department Cases` | Filters and formats cases for one department. |
| `Code Nodes/05-format-case-view.js` | `Format Case View` | Produces a full single-case detail view. |
| `Code Nodes/06-create-diagnostic-plan.js` | `Create Diagnostic Plan` | Generates a fixed troubleshooting plan and the diagnostic log payload. |
| `Code Nodes/07-prepare-resolution-email.js` | `Prepare Resolution Email` | Assembles the Gmail payload after a case is resolved. |
| `Code Nodes/08-attach-case-context.js` | `Attach Case Context` | Re-attaches request metadata so later nodes can route correctly. |
| `Code Nodes/09-detect-delete-approval-reply.js` | `Detect Delete Approval Reply` | Distinguishes normal commands from `YES/NO` approval replies while a delete request is pending. |
| `Code Nodes/10-prepare-pending-delete-row.js` | `Prepare Pending Delete Row` | Creates the pending `admin_actions` row for delete approval tracking. |
| `Code Nodes/11-format-show-vlans-reply.js` | `Code in JavaScript` | Formats the child workflow VLAN inventory into a clean Telegram summary. |

## Python / External Automation

| File | Purpose |
| --- | --- |
| `Python/vlan_manager.sanitized.py` | Sanitized version of the Python VLAN automation script used by the VLAN child workflow. Credentials and live IPs are replaced with placeholders to comply with repository rules. |

## Notes

- The extracted files come from the local workflow export `admin_network_operations_bot_1.after-backup-route.json` and the local Python automation script `vlan_manager.py`.
- Secrets were intentionally removed from the stored script copy.
- Child workflow exports are referenced in the documentation but are not re-committed here because this subsection is focused on evaluation documentation and script evidence.
