# Workflow: Sub-Proxmox-Snapshot-Manager (O9qEG8xaIpdMVIaI)
# Node: SSH: Snapshot Manager
# Node type: n8n-nodes-base.ssh
# Purpose: SSH command executed by n8n. Review before reuse.

={{ `ACTION=${JSON.stringify($json.action || 'create')} TARGET=${JSON.stringify($json.target || 'UbuntuTest')} CONFIRMED=${JSON.stringify(String($json.confirmed || false))} SNAPSHOT=${JSON.stringify($json.snapshot || '')} bash -s <<'BASH'
set -e
ACTION="\${ACTION:-create}"
TARGET="\${TARGET:-UbuntuTest}"
CONFIRMED="\${CONFIRMED:-false}"
SNAPSHOT="\${SNAPSHOT:-}"
tmp=$(mktemp)
pvesh get /cluster/resources --type vm --output-format json > "$tmp"
python3 - "$ACTION" "$TARGET" "$CONFIRMED" "$SNAPSHOT" "$tmp" <<'PYSS'
import json, sys, subprocess, re, datetime

action=sys.argv[1].strip().lower(); target=sys.argv[2].strip().lower(); confirmed=sys.argv[3].strip().lower()=='true'; snapshot=sys.argv[4].strip(); path=sys.argv[5]
vms=[v for v in json.load(open(path)) if v.get('type')=='qemu']
match=None
for vm in vms:
    vmid=str(vm.get('vmid','')); name=str(vm.get('name','')).lower()
    if target==vmid or target in name:
        match=vm; break
if not match:
    print(json.dumps({'success':False,'error':'vm_not_found','target':target})); sys.exit(0)
vmid=str(match['vmid']); name=match.get('name'); node=match.get('node'); status=match.get('status')

def run(cmd):
    p=subprocess.run(cmd, text=True, capture_output=True)
    return {'code':p.returncode,'stdout':p.stdout.strip(),'stderr':p.stderr.strip(),'cmd':' '.join(cmd)}

if action in ('list','list_snapshots'):
    res=run(['qm','listsnapshot',vmid])
    print(json.dumps({'success':res['code']==0,'intent':'list_vm_snapshots','action':'list','vmid':vmid,'name':name,'node':node,'status':status,'snapshots_raw':res['stdout'],'error':res['stderr'] if res['code'] else None}, separators=(',',':'))); sys.exit(0)

if action in ('rollback','revert'):
    if not confirmed:
        print(json.dumps({'success':False,'intent':'rollback_vm_snapshot','error':'confirmation_required','vmid':vmid,'name':name,'snapshot':snapshot,'message':f'Rollback of {name} (VMID {vmid}) to snapshot {snapshot} requires confirmation.'}, separators=(',',':'))); sys.exit(0)
    if not snapshot:
        print(json.dumps({'success':False,'error':'missing_snapshot','vmid':vmid,'name':name})); sys.exit(0)
    res=run(['qm','rollback',vmid,snapshot])
    print(json.dumps({'success':res['code']==0,'intent':'rollback_vm_snapshot','action':'rollback','vmid':vmid,'name':name,'snapshot':snapshot,'result':res,'message':f'Rollback requested for {name} to {snapshot}.' if res['code']==0 else 'Rollback failed.'}, separators=(',',':'))); sys.exit(0)

# default: create snapshot
if not snapshot:
    ts=datetime.datetime.utcnow().strftime('%Y%m%d-%H%M%S')
    snapshot=f'pre-ai-change-{vmid}-{ts}'
desc=f'NetClaw safety snapshot for {name} created before AI-assisted admin action'
res=run(['qm','snapshot',vmid,snapshot,'--description',desc])
print(json.dumps({'success':res['code']==0,'intent':'create_vm_snapshot','action':'create','vmid':vmid,'name':name,'node':node,'status':status,'snapshot':snapshot,'result':res,'message':f'✅ Safety snapshot created for {name} (VMID {vmid}): {snapshot}' if res['code']==0 else 'Snapshot creation failed.'}, separators=(',',':')))
PYSS
rm -f "$tmp"
BASH` }}
