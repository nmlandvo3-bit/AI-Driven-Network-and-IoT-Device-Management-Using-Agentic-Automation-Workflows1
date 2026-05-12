// Workflow: Sub-Proxmox-Resource-Diagnostics (uXZIZQhGiNHp2SkW)
// Node: Parse Proxmox Metrics
// Node type: n8n-nodes-base.code

const stdout = String($json.stdout || '').trim();
const start = stdout.indexOf('{');
const end = stdout.lastIndexOf('}');
if (start < 0 || end < start) return { json: { success:false, error:'no_json_from_proxmox', stdout } };
const vm = JSON.parse(stdout.slice(start, end + 1));
if (!vm.success) return { json: vm };
return { json: vm };
