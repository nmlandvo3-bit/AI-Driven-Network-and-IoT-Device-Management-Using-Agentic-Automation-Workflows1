// Workflow: OpenClaw Proxmox Orchestrator (LDOfaQU10lYbt2Yy)
// Node: Split VMs For IP Lookup
// Node type: n8n-nodes-base.code

const vms = Array.isArray($json.data) ? $json.data : [];
return vms.map(vm => ({ json: { vmid: String(vm.vmid), name: vm.name, node: vm.node, status: vm.status, type: vm.type } }));
