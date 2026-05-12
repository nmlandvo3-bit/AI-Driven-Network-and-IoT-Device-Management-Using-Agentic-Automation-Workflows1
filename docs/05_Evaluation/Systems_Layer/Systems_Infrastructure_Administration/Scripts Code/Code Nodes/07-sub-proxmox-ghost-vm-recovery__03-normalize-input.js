// Workflow: Sub-Proxmox-Ghost-VM-Recovery (XxvFYnpqb1e1zfjI)
// Node: Normalize Input
// Node type: n8n-nodes-base.code

const input=$json.body||$json.query||$json; const raw=input.target??input.vmid??input.name??input.label??'UbuntuTest'; const target=String(raw).replace(/[^A-Za-z0-9_. -]/g,'').trim()||'UbuntuTest'; const service=String(input.service||input.port||'').trim(); return {json:{target,service,confirmed:!!input.confirmed}};
