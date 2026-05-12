// Workflow: OpenClaw Proxmox Orchestrator (LDOfaQU10lYbt2Yy)
// Node: Mark VM Not Running
// Node type: n8n-nodes-base.code

return [{ json: { vmid: $json.vmid, name: $json.name, node: $json.node, status: $json.status, type: $json.type, ip: null, ip_source: null, note: 'vm_not_running' } }];
