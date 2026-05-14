# Workflow JSON Exports

This folder stores the exported n8n workflow JSON files used by the **Admin Network Operations Bot 1** evaluation subsection.

## Included files

- `Admin Network Operations Bot 1.json` - main administrator workflow
- `show_vlans_workflow.json` - child workflow for VLAN inventory display
- `vlans.json` - child workflow for VLAN creation and deletion
- `get_firewall_logs_users.json` - child workflow for denied firewall-log retrieval
- `backup_router_config_workflow.json` - child workflow for router configuration backup

## Why these are included

These files are part of the implementation evidence. They show the actual n8n workflow structure used for this project subsection, including the child workflows called by the main admin bot.

## Repository safety note

The workflow exports were checked before storage here to avoid committing obvious secrets into the evaluation folder.
