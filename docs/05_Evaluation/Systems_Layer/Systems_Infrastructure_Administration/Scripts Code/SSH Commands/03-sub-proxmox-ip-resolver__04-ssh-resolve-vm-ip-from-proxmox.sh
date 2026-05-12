# Workflow: Sub-Proxmox-IP-Resolver (6H9qIGjGiO4vME8i)
# Node: SSH: Resolve VM IP From Proxmox
# Node type: n8n-nodes-base.ssh
# Purpose: SSH command executed by n8n. Review before reuse.

={{ `TARGET=${JSON.stringify($json.target || '')} bash -s <<'BASH'
set -e
TARGET="\${TARGET:-}"
tmp=$(mktemp)
pvesh get /cluster/resources --type vm --output-format json > "$tmp"
python3 - "$TARGET" "$tmp" <<'PYRESOLVE'
import json, sys, subprocess, re, ipaddress

target = (sys.argv[1] or '').strip().lower()
path = sys.argv[2]
vms = [v for v in json.load(open(path)) if v.get('type') == 'qemu']

def mac_for(vmid):
    try:
        cfg = subprocess.check_output(['qm','config',str(vmid)], text=True, stderr=subprocess.DEVNULL)
    except Exception:
        return None
    for line in cfg.splitlines():
        if line.startswith('net'):
            m = re.search(r'(?:virtio|e1000|rtl8139|vmxnet3|ne2k_pci|pcnet)=([0-9A-Fa-f:]{17})', line)
            if m: return m.group(1).lower()
            m = re.search(r'MACAddress[:=]([0-9A-Fa-f:]{17})', line)
            if m: return m.group(1).lower()
    return None

def read_neighbors():
    try:
        return subprocess.check_output(['ip','neighbor','show'], text=True, stderr=subprocess.DEVNULL)
    except Exception:
        return ''

def parse_ips_for_mac(mac, text):
    if not mac: return []
    out=[]
    seen=set()
    for line in text.splitlines():
        if mac.lower() not in line.lower():
            continue
        parts=line.split()
        if not parts:
            continue
        ip=parts[0]
        try:
            obj=ipaddress.ip_address(ip.split('%')[0])
        except Exception:
            continue
        rec={'ip': ip, 'version': obj.version, 'is_link_local': obj.is_link_local, 'neighbor_line': line}
        if ip not in seen:
            seen.add(ip); out.append(rec)
    # Prefer IPv4, then non-link-local IPv6, then link-local
    out.sort(key=lambda r: (0 if r['version']==4 else 1, 1 if r['is_link_local'] else 0, r['ip']))
    return out

def arp_scan_text():
    for cmd in (['arp-scan','--interface=vmbr0','--localnet'], ['arp-scan','-l']):
        try:
            return subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL, timeout=12)
        except Exception:
            pass
    return ''

def parse_arp_scan_for_mac(mac, text):
    if not mac: return []
    out=[]
    seen=set()
    for line in text.splitlines():
        if mac.lower() in line.lower():
            parts=line.split()
            if parts:
                ip=parts[0]
                try:
                    obj=ipaddress.ip_address(ip)
                except Exception:
                    continue
                if ip not in seen:
                    seen.add(ip)
                    out.append({'ip': ip, 'version': obj.version, 'is_link_local': obj.is_link_local, 'neighbor_line': line, 'source': 'arp-scan'})
    return out

# Preload neighbor cache; if IPv4 is missing later, arp-scan fallback will refresh it.
neigh = read_neighbors()
scan_cache = None

matches=[]
for vm in vms:
    vmid=str(vm.get('vmid',''))
    name=str(vm.get('name',''))
    if target and not (vmid == target or target in name.lower()):
        continue
    mac=mac_for(vmid)
    ips=parse_ips_for_mac(mac, neigh)
    if mac and not any(i['version']==4 for i in ips):
        if scan_cache is None:
            scan_cache = arp_scan_text()
        scan_ips = parse_arp_scan_for_mac(mac, scan_cache)
        # Merge scan result first if IPv4
        by_ip={i['ip']: i for i in ips}
        for i in scan_ips:
            by_ip.setdefault(i['ip'], i)
        ips=list(by_ip.values())
        ips.sort(key=lambda r: (0 if r['version']==4 else 1, 1 if r['is_link_local'] else 0, r['ip']))
    matches.append({
        'vmid': int(vmid) if vmid.isdigit() else vmid,
        'name': name,
        'node': vm.get('node'),
        'status': vm.get('status'),
        'mac': mac,
        'ip': ips[0]['ip'] if ips else None,
        'ipv4': next((i['ip'] for i in ips if i['version']==4), None),
        'ips': ips,
        'maxmem': vm.get('maxmem'),
        'maxcpu': vm.get('maxcpu'),
        'uptime': vm.get('uptime')
    })

print(json.dumps({'success': bool(matches), 'target': target, 'count': len(matches), 'data': matches[0] if target and len(matches)==1 else matches, 'results': matches}, separators=(',', ':')))
PYRESOLVE
rm -f "$tmp"
BASH` }}
