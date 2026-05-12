// Workflow: Sub-Proxmox-IP-Resolver (6H9qIGjGiO4vME8i)
// Node: Normalize Input
// Node type: n8n-nodes-base.code

const input = $json.body || $json.query || $json;
const rawTarget = input.target ?? input.vmid ?? input.name ?? input.label ?? '';
const target = String(rawTarget).replace(/[^A-Za-z0-9_. -]/g, '').trim();
return { json: { target, requested_at: new Date().toISOString(), source: $json.body ? 'webhook' : 'execute_workflow' } };
