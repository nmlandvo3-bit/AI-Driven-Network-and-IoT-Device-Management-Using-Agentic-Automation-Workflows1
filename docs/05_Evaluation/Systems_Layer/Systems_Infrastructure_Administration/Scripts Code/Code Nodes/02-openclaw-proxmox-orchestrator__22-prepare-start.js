// Workflow: OpenClaw Proxmox Orchestrator (LDOfaQU10lYbt2Yy)
// Node: Prepare Start
// Node type: n8n-nodes-base.code

const req = $('Parse OpenClaw Request').first().json;
const target = req.target || {};
const vmid = String(target.vmid || '');
const vms = Array.isArray($json.data) ? $json.data : [];
const match = vms.find(vm => String(vm.vmid) === vmid);
if (!match) return [{ json: { success: false, intent: 'start_vm', error: 'vm_not_found', target } }];
return [{ json: { success: true, intent: 'start_vm', target, vmid: String(match.vmid), vmName: match.name, vmNode: match.node, vmType: match.type, status_before: match.status } }];
