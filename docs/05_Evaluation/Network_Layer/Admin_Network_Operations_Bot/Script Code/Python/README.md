# Python Scripts

This folder contains the Python automation used by the **Admin Network Operations Bot 1** workflow.

## Important security rule

The real workflow used SSH/jump-host access to reach network devices, but the repository copy here does **not** expose live credentials.

So in this folder:

- real usernames may be replaced with placeholders when needed;
- real passwords are removed;
- live management IPs used only for secret access paths are replaced with placeholders;
- the workflow logic is preserved for evaluation/documentation purposes.

## Python scripts used

### 1. `vlan_manager.sanitized.py`

This is the Python automation script used by the VLAN child workflow in n8n.

### How it was used in the workflow

The n8n child workflow `vlans` called this Python script to perform switch-side VLAN operations for the admin bot.

The script handled two main actions:

- `create`
- `delete`

### Execution role in the overall design

The full path was:

1. Telegram admin sends a command such as `create vlan 80 Research` or `delete vlan 80`
2. `Admin Network Operations Bot 1` routes the request
3. the child workflow `vlans` receives the VLAN action
4. the child workflow runs the Python automation logic
5. the Python script connects through the firewall/jump path
6. the script reaches the Cisco switch
7. the script applies the requested VLAN change
8. the script returns JSON output to n8n
9. n8n formats the result and replies back to Telegram

## What the script does

### For VLAN creation

The script:

- checks whether the VLAN already exists;
- reads `show interface status` to find a usable access port;
- creates the VLAN;
- names the VLAN;
- assigns a selected access port to that VLAN;
- saves the switch configuration;
- creates or updates the related firewall VLAN interface;
- returns a success/error JSON response.

### For VLAN deletion

The script:

- checks whether the VLAN exists;
- blocks deletion of protected default VLANs;
- reads `show vlan brief` to find ports assigned to the VLAN;
- moves those ports back to VLAN 1;
- removes the VLAN from the switch;
- saves the configuration;
- removes the related firewall VLAN interface;
- returns a success/error JSON response.

## SSH / access path used

The original automation path used a chained connection model:

1. connect to the firewall/jump device;
2. SSH from there to an intermediate target if required;
3. SSH onward to the switch;
4. run Cisco CLI commands on `IOU1`;
5. return to the firewall context;
6. update the firewall-side VLAN interface settings.

For safety, this repository version shows that path only with placeholders such as:

- `<FORTIGATE_MGMT_IP>`
- `<FORTIGATE_USERNAME>`
- `<FORTIGATE_PASSWORD>`
- `<JUMP_USER>`
- `<JUMP_HOST>`
- `<JUMP_PASSWORD>`
- `<SWITCH_USER>`
- `<SWITCH_MGMT_IP>`
- `<SWITCH_PASSWORD>`

## Why only one Python script is included

Based on the preserved workspace evidence for this workflow path, this is the Python script directly used for the VLAN automation branch.

Other behavior in the workflow was handled by:

- n8n nodes;
- n8n Code-node JavaScript;
- child workflow orchestration;
- router backup flow through the backup child workflow.

So the Python folder contains the Python automation actually used by this part of the project, rather than unrelated scripts.


## Additional Python scripts from `/home/mlandvo/GNS3/projects`

Besides `vlan_manager`, the GNS3 projects directory contained these workflow-support Python scripts, and sanitized copies are now included here:

- `BACKUP.sanitized.py` - backup-oriented network automation helper preserved from the GNS3 projects folder
- `router_backup.sanitized.py` - router TFTP backup script for `R2`
- `show_vlans_workflow.sanitized.py` - VLAN inventory retrieval/parsing script
- `show_policies.sanitized.py` - firewall policy inspection script
- `get_acl_list.sanitized.py` - ACL listing/enrichment script that maps subnets to VLAN names

### How they were used

- `show_vlans_workflow.sanitized.py` supported the **show VLANs** child workflow.
- `router_backup.sanitized.py` and `BACKUP.sanitized.py` relate to the **router backup / configuration export** path.
- `show_policies.sanitized.py` and `get_acl_list.sanitized.py` are supporting inspection scripts for firewall/ACL visibility and policy context.

As with the other Python file, the repository copies keep the logic but remove or replace live device-access secrets.
