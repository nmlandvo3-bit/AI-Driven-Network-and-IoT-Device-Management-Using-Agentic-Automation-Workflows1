// Workflow: OpenClaw Proxmox Orchestrator (LDOfaQU10lYbt2Yy)
// Node: Format All VM IPs
// Node type: n8n-nodes-base.code

const input = $json;
let data = [];
if (Array.isArray(input.data)) data = input.data;
else if (Array.isArray(input.results)) data = input.results;
else data = $input.all().map(i => i.json);

function normalizeIps(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'object') return [v];
  return [];
}
function statusIcon(status) {
  if (status === 'running') return '🟢';
  if (status === 'stopped') return '🔴';
  return '🟡';
}
function ipText(vm) {
  const ip = vm.ipv4 || vm.ip || null;
  if (ip) return ip;
  if (vm.status === 'running') return 'No IP found yet';
  return 'VM stopped';
}

data = data.map(vm => ({
  vmid: String(vm.vmid ?? ''),
  name: vm.name ?? vm.label ?? '',
  node: vm.node ?? '',
  status: vm.status ?? '',
  type: vm.type ?? 'qemu',
  mac: vm.mac ?? null,
  ip: vm.ipv4 || vm.ip || null,
  ipv4: vm.ipv4 || (vm.ip && /^\d+\./.test(vm.ip) ? vm.ip : null),
  ips: normalizeIps(vm.ips),
  ip_source: (vm.ipv4 || vm.ip) ? (vm.ip_source || vm.ipsource || 'proxmox-mac-arp-resolver') : null,
  note: (vm.ipv4 || vm.ip) ? null : (vm.status === 'running' ? 'no_ip_found_in_arp_or_arp_scan' : 'vm_not_running')
}));

const running = data.filter(v => v.status === 'running').length;
const withIp = data.filter(v => v.ipv4 || v.ip).length;
const lines = [];
lines.push('🌐 *Proxmox VM IP Address Summary*');
lines.push(`📦 Total VMs: ${data.length} | 🟢 Running: ${running} | ✅ With IPv4: ${withIp}`);
lines.push('');
for (const vm of data) {
  lines.push(`${statusIcon(vm.status)} *${vm.vmid} — ${vm.name || 'Unnamed VM'}*`);
  lines.push(`   📡 Status: ${vm.status || 'unknown'} | 📍 Node: ${vm.node || '-'}`);
  lines.push(`   🌍 IPv4: ${ipText(vm)}`);
  if (vm.mac) lines.push(`   🔗 MAC: ${vm.mac}`);
  if (vm.ip_source) lines.push(`   🧭 Source: ${vm.ip_source}`);
  if (vm.note === 'vm_not_running') lines.push('   ℹ️ Note: VM is stopped, so no live IP is expected.');
  else if (vm.note) lines.push(`   ⚠️ Note: ${vm.note}`);
  lines.push('');
}
lines.push('💡 IPs are resolved agentlessly from Proxmox VM metadata, bridge neighbor table, and arp-scan.');

return [{ json: { success: true, intent: 'get_all_vm_ips', count: data.length, data, message: lines.join('\n') } }];
