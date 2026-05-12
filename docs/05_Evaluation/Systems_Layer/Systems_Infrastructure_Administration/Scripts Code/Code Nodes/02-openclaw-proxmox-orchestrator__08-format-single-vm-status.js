// Workflow: OpenClaw Proxmox Orchestrator (LDOfaQU10lYbt2Yy)
// Node: Format Single VM Status
// Node type: n8n-nodes-base.code

const req = $('Parse OpenClaw Request').first().json;
const target = req.target || {};
const vmid = String(target.vmid || '');
const vms = Array.isArray($json.data) ? $json.data : [];
const match = vms.find(vm => String(vm.vmid) === vmid);
if (!match) { return [{ json: { success: false, intent: 'get_vm_status', error: 'vm_not_found', target } }]; }
return [{ json: { success: true, intent: 'get_vm_status', target, data: { vmid: String(match.vmid), name: match.name, node: match.node, status: match.status, type: match.type } } }];
