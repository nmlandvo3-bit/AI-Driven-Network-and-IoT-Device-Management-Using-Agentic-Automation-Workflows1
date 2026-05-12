// Workflow: Sub-Proxmox-Idle-Lab-Cleanup (5HVdDUq7yIROyOFf)
// Node: Analyze Idle Candidates
// Node type: n8n-nodes-base.code

const vms = Array.isArray($json.data) ? $json.data : [];
function gb(b){const n=Number(b||0);return n?(n/1024/1024/1024).toFixed(1)+' GB':'0 GB'}
function pct(x){return (Number(x||0)*100).toFixed(2)+'%'}
function up(s){s=Number(s||0); if(!s)return '-'; const d=Math.floor(s/86400),h=Math.floor((s%86400)/3600); return `${d}d ${h}h`;}
const candidates=[];
for (const vm of vms) {
 const cpu=Number(vm.cpu||0)*100; const net=Number(vm.netin||0)+Number(vm.netout||0); const stopped=vm.status==='stopped';
 let reason=null, recommendation=null;
 if (stopped) { reason='VM is stopped and consuming no active CPU/RAM, but disk/storage may be reclaimable if obsolete.'; recommendation='Review whether it should stay archived or be removed later; do not delete automatically.'; }
 else if (cpu < 1 && net < 100*1024*1024 && Number(vm.uptime||0)>3600) { reason='Running with very low CPU/network activity.'; recommendation='Candidate for stop-after-approval if not needed for lab work.'; }
 if (reason) candidates.push({vmid:String(vm.vmid),name:vm.name,node:vm.node,status:vm.status,cpu_usage:pct(vm.cpu),ram_total:gb(vm.maxmem),uptime:up(vm.uptime),reason,recommendation});
}
const lines=['🧹 *Idle Lab Cleanup Recommendations*',''];
if (!candidates.length) lines.push('No obvious idle cleanup candidates found.');
for (const c of candidates){ const icon=c.status==='running'?'🟢':'🔴'; lines.push(`${icon} *${c.vmid} — ${c.name}*`); lines.push(`   CPU: ${c.cpu_usage} | RAM allocation: ${c.ram_total} | Uptime: ${c.uptime}`); lines.push(`   Reason: ${c.reason}`); lines.push(`   Recommendation: ${c.recommendation}`); lines.push(''); }
lines.push('⚠️ This is recommendation-only. Stopping/removing VMs must be approved separately.');
return [{json:{success:true,intent:'cleanup_idle_vms',count:candidates.length,data:candidates,message:lines.join('\n')}}];
