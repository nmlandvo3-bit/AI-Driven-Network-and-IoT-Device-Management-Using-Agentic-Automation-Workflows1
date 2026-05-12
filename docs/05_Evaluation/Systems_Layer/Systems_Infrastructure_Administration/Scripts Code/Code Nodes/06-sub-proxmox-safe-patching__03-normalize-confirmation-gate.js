// Workflow: Sub-Proxmox-Safe-Patching (thsz2pCu12NxVYfB)
// Node: Normalize / Confirmation Gate
// Node type: n8n-nodes-base.code

const input = $json.body || $json.query || $json;
const rawTarget = input.target ?? input.vmid ?? input.name ?? input.label ?? 'UbuntuTest';
const target = String(rawTarget).replace(/[^A-Za-z0-9_. -]/g, '').trim() || 'UbuntuTest';
const confirmed = !!input.confirmed;
const applyUpgrade = input.apply_upgrade !== false;
if (!confirmed) {
  return { json: { target, confirmed, apply_upgrade: applyUpgrade, stop_here: true, success: false, intent: 'safe_patch_vm', error: 'confirmation_required', message: `⚠️ Safe patching for ${target} requires approval. I will create a Proxmox snapshot first, then run OS updates, then perform health checks.` } };
}
return { json: { target, confirmed, apply_upgrade: applyUpgrade, stop_here: false, requested_at: new Date().toISOString() } };
