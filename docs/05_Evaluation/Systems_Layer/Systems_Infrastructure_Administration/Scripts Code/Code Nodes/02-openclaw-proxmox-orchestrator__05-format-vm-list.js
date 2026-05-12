// Workflow: OpenClaw Proxmox Orchestrator (LDOfaQU10lYbt2Yy)
// Node: Format VM List
// Node type: n8n-nodes-base.code

const req = $('Parse OpenClaw Request').first().json;
const vms = Array.isArray($json.data) ? $json.data : [];
function gb(bytes) {
  const n = Number(bytes || 0);
  if (!n) return '0 GB';
  return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
}
function pct(frac) {
  const n = Number(frac || 0) * 100;
  return n.toFixed(n >= 10 ? 1 : 2) + '%';
}
function uptime(sec) {
  sec = Number(sec || 0);
  if (!sec) return '-';
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}
function statusIcon(s) {
  return s === 'running' ? '🟢' : s === 'stopped' ? '🔴' : '🟡';
}
function bytesHuman(bytes) {
  let n = Number(bytes || 0);
  const units = ['B','KB','MB','GB','TB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
}
const data = vms.map(vm => {
  const mem = Number(vm.mem || 0);
  const maxmem = Number(vm.maxmem || 0);
  const memPct = maxmem ? (mem / maxmem * 100) : 0;
  return {
    vmid: String(vm.vmid),
    name: vm.name,
    node: vm.node,
    status: vm.status,
    type: vm.type,
    cpu_usage: pct(vm.cpu),
    cpu_cores: vm.maxcpu || null,
    ram_used: gb(vm.mem),
    ram_total: gb(vm.maxmem),
    ram_usage: memPct.toFixed(1) + '%',
    disk_size: gb(vm.maxdisk),
    disk_read: bytesHuman(vm.diskread),
    disk_write: bytesHuman(vm.diskwrite),
    net_in: bytesHuman(vm.netin),
    net_out: bytesHuman(vm.netout),
    uptime: uptime(vm.uptime)
  };
});
const running = data.filter(v => v.status === 'running').length;
const stopped = data.filter(v => v.status === 'stopped').length;
const lines = [];
lines.push('🖥️ *Proxmox VM Detailed Summary*');
lines.push(`📊 Total: ${data.length} | 🟢 Running: ${running} | 🔴 Stopped: ${stopped}`);
lines.push('');
for (const vm of data) {
  lines.push(`${statusIcon(vm.status)} *${vm.vmid} — ${vm.name}*`);
  lines.push(`   📍 Node: ${vm.node} | State: ${vm.status}`);
  lines.push(`   🧠 RAM: ${vm.ram_used} / ${vm.ram_total} (${vm.ram_usage})`);
  lines.push(`   ⚙️ CPU: ${vm.cpu_usage} of ${vm.cpu_cores ?? '-'} cores`);
  lines.push(`   💾 Disk: ${vm.disk_size} | Read ${vm.disk_read} / Write ${vm.disk_write}`);
  lines.push(`   🌐 Net: In ${vm.net_in} / Out ${vm.net_out}`);
  lines.push(`   ⏱️ Uptime: ${vm.uptime}`);
  lines.push('');
}
return [{ json: { success: true, intent: 'list_vm_status', detail: !!req.detail, count: data.length, summary: { total: data.length, running, stopped }, message: lines.join('\n'), data } }];
