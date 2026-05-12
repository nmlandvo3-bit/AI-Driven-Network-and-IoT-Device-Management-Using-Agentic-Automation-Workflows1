// Workflow: Sub-Proxmox-Resource-Diagnostics (uXZIZQhGiNHp2SkW)
// Node: Normalize Input
// Node type: n8n-nodes-base.code

const input = $json.body || $json.query || $json;
const rawTarget = input.target ?? input.vmid ?? input.name ?? input.label ?? 'UbuntuTest';
const target = String(rawTarget).replace(/[^A-Za-z0-9_. -]/g, '').trim() || 'UbuntuTest';
return { json: { target, requested_at: new Date().toISOString() } };
