// Workflow: Sub-Proxmox-Snapshot-Manager (O9qEG8xaIpdMVIaI)
// Node: Normalize Input
// Node type: n8n-nodes-base.code

const input = $json.body || $json.query || $json;
const action = String(input.action || 'create').toLowerCase().trim();
const rawTarget = input.target ?? input.vmid ?? input.name ?? input.label ?? 'UbuntuTest';
const target = String(rawTarget).replace(/[^A-Za-z0-9_. -]/g, '').trim() || 'UbuntuTest';
const confirmed = !!input.confirmed;
const snapshot = String(input.snapshot || input.snapshot_name || '').replace(/[^A-Za-z0-9_.-]/g, '').trim();
return { json: { action, target, confirmed, snapshot, requested_at: new Date().toISOString() } };
