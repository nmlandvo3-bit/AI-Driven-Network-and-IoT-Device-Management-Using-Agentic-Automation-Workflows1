// Workflow: Sub-Proxmox-Ghost-VM-Recovery (XxvFYnpqb1e1zfjI)
// Node: Format Recovery Advice
// Node type: n8n-nodes-base.code

const r = $json;
const data = r.data || r;
const ip = data.ipv4 || data.ip || null;
const lines = [];
lines.push(`🩺 *Ghost VM Recovery Check — ${data.name || r.target || 'VM'}*`);
lines.push(`🖥️ VMID: ${data.vmid || '-'} | State: ${data.status || '-'} | IP: ${ip || 'unknown'}`);
lines.push('');
if (data.status !== 'running') {
  lines.push('🔴 VM is not running. Recommended action: start VM after approval.');
} else if (!ip) {
  lines.push('⚠️ VM is running but no IP was resolved. Recommended action: check bridge/ARP/DHCP or install QEMU Guest Agent.');
} else {
  lines.push('✅ VM is running and has an IP.');
  lines.push('Next escalation path: ping → SSH → service/docker logs → service restart → VM reboot only if approved.');
}
lines.push('');
lines.push('💡 *Recommendation:* Least-disruptive recovery first. Do not hard reset unless service restart/reboot is approved.');
return { json: { success: true, intent: 'recover_ghost_vm', target: data.name || r.target, data, message: lines.join('\n') } };
