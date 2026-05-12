// Workflow: Sub-Proxmox-Snapshot-Manager (O9qEG8xaIpdMVIaI)
// Node: Format Snapshot Result
// Node type: n8n-nodes-base.code

const stdout = String($json.stdout || '').trim();
const start = stdout.indexOf('{');
const end = stdout.lastIndexOf('}');
if (start < 0 || end < start) return [{ json: { success:false, error:'no_json_from_snapshot_manager', stdout } }];
const r = JSON.parse(stdout.slice(start, end + 1));
if (r.message) return [{ json: r }];
if (r.action === 'list') {
  r.message = `📸 Snapshots for ${r.name} (VMID ${r.vmid}):\n\n${r.snapshots_raw || 'No snapshots found.'}`;
}
return [{ json: r }];
