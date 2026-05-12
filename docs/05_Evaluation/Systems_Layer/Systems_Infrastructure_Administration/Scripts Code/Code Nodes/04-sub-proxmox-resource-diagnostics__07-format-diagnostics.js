// Workflow: Sub-Proxmox-Resource-Diagnostics (uXZIZQhGiNHp2SkW)
// Node: Format Diagnostics
// Node type: n8n-nodes-base.code

function gb(bytes) { const n=Number(bytes||0); return n ? (n/1024/1024/1024).toFixed(1)+' GB' : '0 GB'; }
function pct(frac) { const n=Number(frac||0)*100; return n.toFixed(n>=10?1:2)+'%'; }
function uptime(sec){ sec=Number(sec||0); if(!sec) return '-'; const d=Math.floor(sec/86400), h=Math.floor((sec%86400)/3600), m=Math.floor((sec%3600)/60); return `${d}d ${h}h ${m}m`; }
const vm = $('Parse Proxmox Metrics').first().json;
const guest = $json.stdout ? String($json.stdout) : '';
const memPct = vm.maxmem ? (Number(vm.mem||0)/Number(vm.maxmem)*100) : 0;
let recommendation = 'No immediate critical issue detected from Proxmox metrics.';
if (memPct >= 90) recommendation = 'High RAM pressure detected. Consider closing workloads, restarting heavy services, or increasing RAM after approval.';
else if ((Number(vm.cpu||0)*100) >= 80) recommendation = 'High CPU usage detected. Inspect top CPU processes and consider service restart or CPU increase after approval.';
else if (vm.status !== 'running') recommendation = 'VM is not running. Start it before guest-level diagnostics.';
const lines=[];
lines.push(`🧪 *Resource Diagnostics — ${vm.name}*`);
lines.push(`🖥️ VMID: ${vm.vmid} | Node: ${vm.node} | State: ${vm.status}`);
lines.push(`🌐 IP: ${vm.ipv4 || vm.ip || 'unknown'} | MAC: ${vm.mac || 'unknown'}`);
lines.push('');
lines.push('📊 *Proxmox Metrics*');
lines.push(`🧠 RAM: ${gb(vm.mem)} / ${gb(vm.maxmem)} (${memPct.toFixed(1)}%)`);
lines.push(`⚙️ CPU: ${pct(vm.cpu)} of ${vm.maxcpu || '-'} cores`);
lines.push(`💾 Disk Size: ${gb(vm.maxdisk)}`);
lines.push(`🌐 Network: In ${gb(vm.netin)} / Out ${gb(vm.netout)}`);
lines.push(`⏱️ Uptime: ${uptime(vm.uptime)}`);
if (guest) {
  lines.push(''); lines.push('🔎 *Guest OS Snapshot*');
  const keep = guest.split('\n').slice(0, 80).join('\n');
  lines.push('```'); lines.push(keep); lines.push('```');
}
lines.push(''); lines.push(`💡 *Recommendation:* ${recommendation}`);
return [{ json: { success:true, intent:'diagnose_vm_resources', target: vm.name, data:{...vm, ram_used:gb(vm.mem), ram_total:gb(vm.maxmem), ram_usage:memPct.toFixed(1)+'%', cpu_usage:pct(vm.cpu), uptime_text:uptime(vm.uptime), guest_output:guest, recommendation}, message: lines.join('\n') } }];
