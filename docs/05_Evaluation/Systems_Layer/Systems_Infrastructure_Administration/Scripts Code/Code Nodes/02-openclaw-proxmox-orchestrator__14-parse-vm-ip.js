// Workflow: OpenClaw Proxmox Orchestrator (LDOfaQU10lYbt2Yy)
// Node: Parse VM IP
// Node type: n8n-nodes-base.code

const base = $('VM Running For IP?').item.json;
const resolver = $json;
const data = resolver.data && !Array.isArray(resolver.data) ? resolver.data : resolver;
const ipv4 = data.ipv4 || (Array.isArray(data.ips) ? (data.ips.find(i => i.version === 4)?.ip) : null);
const ip = ipv4 || data.ip || null;
return [{ json: {
  vmid: base.vmid,
  name: base.name,
  node: base.node,
  status: base.status,
  type: base.type,
  mac: data.mac || null,
  ip,
  ipv4: ipv4 || null,
  ips: data.ips || [],
  ip_source: ip ? (ipv4 ? 'proxmox-arp-ipv4' : 'proxmox-arp') : null,
  resolver_success: resolver.success ?? !!ip,
  note: ip ? null : 'no_ip_found_by_proxmox_ip_resolver'
} }];
