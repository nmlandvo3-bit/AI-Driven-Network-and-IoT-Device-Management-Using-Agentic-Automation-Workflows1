# Workflow: Sub-Proxmox-Resource-Diagnostics (uXZIZQhGiNHp2SkW)
# Node: SSH: Collect Proxmox Metrics
# Node type: n8n-nodes-base.ssh
# Purpose: SSH command executed by n8n. Review before reuse.

={{ `TARGET=${JSON.stringify($json.target || 'UbuntuTest')} bash -s <<'BASH'
set -e
TARGET="\${TARGET:-UbuntuTest}"
# Use the resolver-style logic locally on Proxmox to find target VM metadata and IPv4.
tmp=$(mktemp)
pvesh get /cluster/resources --type vm --output-format json > "$tmp"
python3 - "$TARGET" "$tmp" <<'PYRES'
import json, sys, subprocess, re, ipaddress

target=(sys.argv[1] or '').strip().lower()
vms=[v for v in json.load(open(sys.argv[2])) if v.get('type')=='qemu']

def mac_for(vmid):
    try: cfg=subprocess.check_output(['qm','config',str(vmid)], text=True, stderr=subprocess.DEVNULL)
    except Exception: return None
    for line in cfg.splitlines():
        if line.startswith('net'):
            m=re.search(r'(?:virtio|e1000|rtl8139|vmxnet3|ne2k_pci|pcnet)=([0-9A-Fa-f:]{17})', line)
            if m: return m.group(1).lower()
            m=re.search(r'MACAddress[:=]([0-9A-Fa-f:]{17})', line)
            if m: return m.group(1).lower()
    return None

def ips_for(mac):
    if not mac: return []
    ips=[]; seen=set()
    try: neigh=subprocess.check_output(['ip','neighbor','show'], text=True, stderr=subprocess.DEVNULL)
    except Exception: neigh=''
    for line in neigh.splitlines():
        if mac.lower() in line.lower():
            ip=line.split()[0]
            try: obj=ipaddress.ip_address(ip.split('%')[0])
            except Exception: continue
            if ip not in seen:
                seen.add(ip); ips.append({'ip':ip,'version':obj.version,'is_link_local':obj.is_link_local})
    if not any(i['version']==4 for i in ips):
        for cmd in (['arp-scan','--interface=vmbr0','--localnet'], ['arp-scan','-l']):
            try: scan=subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL, timeout=12); break
            except Exception: scan=''
        for line in scan.splitlines():
            if mac.lower() in line.lower():
                ip=line.split()[0]
                try: obj=ipaddress.ip_address(ip)
                except Exception: continue
                if ip not in seen:
                    seen.add(ip); ips.append({'ip':ip,'version':obj.version,'is_link_local':obj.is_link_local})
    ips.sort(key=lambda r:(0 if r['version']==4 else 1, 1 if r['is_link_local'] else 0, r['ip']))
    return ips

match=None
for vm in vms:
    vmid=str(vm.get('vmid','')); name=str(vm.get('name',''))
    if vmid==target or target in name.lower():
        match=vm; break
if not match:
    print(json.dumps({'success':False,'error':'vm_not_found','target':target}))
    sys.exit(0)
mac=mac_for(match['vmid']); ips=ips_for(mac)
match_out={
 'success':True,'vmid':str(match.get('vmid')),'name':match.get('name'),'node':match.get('node'),'status':match.get('status'),'type':match.get('type'),
 'cpu':match.get('cpu'),'maxcpu':match.get('maxcpu'),'mem':match.get('mem'),'maxmem':match.get('maxmem'),'maxdisk':match.get('maxdisk'),
 'diskread':match.get('diskread'),'diskwrite':match.get('diskwrite'),'netin':match.get('netin'),'netout':match.get('netout'),'uptime':match.get('uptime'),
 'mac':mac,'ip':ips[0]['ip'] if ips else None,'ipv4':next((i['ip'] for i in ips if i['version']==4), None),'ips':ips
}
print(json.dumps(match_out, separators=(',',':')))
PYRES
rm -f "$tmp"
BASH` }}
