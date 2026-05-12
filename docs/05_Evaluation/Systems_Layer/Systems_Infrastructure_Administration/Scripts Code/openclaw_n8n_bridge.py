#!/usr/bin/env python3
import argparse
import json
import re
import sys
import uuid
from pathlib import Path
from urllib import request, error

ROOT = Path('/home/mlab-network/.openclaw/workspace/projects/ai-driven-network-iot-agentic-automation')
ALIASES_PATH = ROOT / 'config' / 'vm-aliases.json'
PENDING_PATH = ROOT / 'tmp' / 'openclaw-bridge-pending.json'
WEBHOOK_URL = 'http://192.168.0.152:5678/webhook/LDOfaQU10lYbt2Yy/webhook/openclaw-proxmox-orchestrator'


def load_aliases():
    with open(ALIASES_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)['vms']


def normalize(text: str) -> str:
    text = text.lower().strip()
    text = text.replace('-', ' ').replace('_', ' ')
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def parse_intent(raw_text: str):
    t = normalize(raw_text)

    # Ghost VM/app unreachable and idle cleanup scenarios.
    if any(p in t for p in ['cannot access', "can't access", 'cant access', 'unreachable', 'not responding', 'app down', 'server down', 'service down', 'people cannot access']):
        return {'intent': 'recover_ghost_vm', 'target_required': True, 'state_changing': False}
    if any(p in t for p in ['idle vms', 'unused vms', 'cleanup', 'clean up', 'save resources', 'old vms', 'waste resources']):
        return {'intent': 'cleanup_idle_vms', 'target_required': False, 'state_changing': False}

    # Safe patching, snapshots, and rollback.
    if any(p in t for p in ['safe update', 'safely update', 'safe patch', 'patch ', ' update ', ' upgrade ']) and any(w in t for w in ['ubuntu', 'test', 'n8n', 'server', 'vm', 'machine']):
        return {'intent': 'safe_patch_vm', 'target_required': True, 'state_changing': True}
    if any(p in t for p in ['create snapshot', 'take snapshot', 'make snapshot', 'create backup', 'safety snapshot', 'restore point']):
        return {'intent': 'create_vm_snapshot', 'target_required': True, 'state_changing': False}
    if any(p in t for p in ['rollback', 'roll back', 'revert', 'restore snapshot']):
        return {'intent': 'rollback_vm_snapshot', 'target_required': True, 'state_changing': True}

    # Resource diagnostics for one VM, e.g. "Ubuntu Test is slow" or
    # "check CPU and RAM of Ubuntu Test".
    if any(p in t for p in [
        'is slow', 'is lagging', 'keeps crashing', 'resource diagnostics',
        'diagnose', 'diagnostic', 'why is', 'cpu of', 'ram of', 'memory of',
        'performance of', 'bottleneck'
    ]):
        return {'intent': 'diagnose_vm_resources', 'target_required': True, 'state_changing': False}

    # Detailed inventory/resource summary. This must be handled by the bridge
    # before falling back to the help text, because admins speak naturally.
    if any(p in t for p in [
        'detail information', 'detailed information', 'detailed info', 'detail info',
        'full information', 'full info', 'vm details', 'vms details', 'machine details',
        'resource usage', 'resources usage', 'ram usage', 'memory usage', 'cpu usage',
        'hardware usage', 'proxmox summary', 'lab summary'
    ]):
        return {'intent': 'list_vm_status', 'target_required': False, 'state_changing': False, 'detail': True}

    # Natural-language IP requests. Tolerate "machines", "servers", and the
    # common typo "vs" for "vms". Do not require the word "all".
    if any(p in t for p in ['all vm ips', 'vm ips', 'vms ips', 'ip addresses', 'ips of', 'ip address of', 'addresses of']) or (
        any(w in t.split() for w in ['ip', 'ips', 'address', 'addresses']) and
        any(w in t.split() for w in ['all', 'vm', 'vms', 'vs', 'machine', 'machines', 'server', 'servers', 'host', 'hosts'])
    ):
        return {'intent': 'get_all_vm_ips', 'target_required': False, 'state_changing': False}

    if any(p in t for p in ['status of vms', 'status of all vms', 'check status of vms', 'which vms are running', 'list vm status', 'list vms', 'show vms', 'show machines']):
        return {'intent': 'list_vm_status', 'target_required': False, 'state_changing': False}
    if t.startswith('start ') or t.startswith('boot ') or ' power on ' in f' {t} ':
        return {'intent': 'start_vm', 'target_required': True, 'state_changing': True}
    if t.startswith('stop ') or t.startswith('shutdown ') or ' shut down ' in f' {t} ' or ' power off ' in f' {t} ':
        return {'intent': 'stop_vm', 'target_required': True, 'state_changing': True}
    if t.startswith('reboot ') or t.startswith('restart ') or t.startswith('reset '):
        return {'intent': 'reboot_vm', 'target_required': True, 'state_changing': True}
    if 'status of' in t or t.startswith('check status of ') or t.startswith('is '):
        return {'intent': 'get_vm_status', 'target_required': True, 'state_changing': False}
    return None


def extract_target_text(raw_text: str, intent: str):
    t = normalize(raw_text)
    for prefix in ['check status of ', 'status of ', 'is ', 'start ', 'stop ', 'reboot ', 'restart ', 'diagnose ', 'check resources of ', 'resource diagnostics for ', 'safely update ', 'safe update ', 'safe patch ', 'patch ', 'update ', 'upgrade ', 'create snapshot of ', 'take snapshot of ', 'make snapshot of ', 'rollback ', 'roll back ', 'revert ']:
        if t.startswith(prefix):
            target = t[len(prefix):].strip()
            if intent == 'get_vm_status' and target.endswith(' running'):
                target = target[:-8].strip()
            return target
    if intent in ('diagnose_vm_resources', 'safe_patch_vm', 'create_vm_snapshot', 'rollback_vm_snapshot', 'recover_ghost_vm'):
        # Find any known alias mentioned inside the sentence.
        try:
            vms = load_aliases()
            for vm in vms:
                fields = [vm['canonical_name'], vm['proxmox_name'], *vm.get('aliases', [])]
                for f in fields:
                    nf = normalize(f)
                    if nf and nf in t:
                        return f
        except Exception:
            pass
    return None


def resolve_target(target_text: str, vms):
    if not target_text:
        return {'matched': False, 'reason': 'missing_target'}
    target_norm = normalize(target_text)

    for vm in vms:
        if target_text.isdigit() and vm['vmid'] == target_text:
            return {'matched': True, 'match_type': 'vmid', 'target': vm, 'alias_used': target_text}

    exact_canonical = [vm for vm in vms if normalize(vm['canonical_name']) == target_norm]
    if len(exact_canonical) == 1:
        return {'matched': True, 'match_type': 'exact_canonical_name', 'target': exact_canonical[0], 'alias_used': target_text}

    exact_alias = [vm for vm in vms if any(normalize(a) == target_norm for a in vm.get('aliases', []))]
    if len(exact_alias) == 1:
        return {'matched': True, 'match_type': 'exact_alias', 'target': exact_alias[0], 'alias_used': target_text}
    if len(exact_alias) > 1:
        return {'matched': False, 'reason': 'ambiguous', 'candidates': exact_alias}

    partial = []
    for vm in vms:
        fields = [vm['canonical_name'], vm['proxmox_name'], *vm.get('aliases', [])]
        if any(target_norm in normalize(f) for f in fields):
            partial.append(vm)
    uniq = {vm['vmid']: vm for vm in partial}
    partial = list(uniq.values())
    if len(partial) == 1:
        return {'matched': True, 'match_type': 'partial_alias', 'target': partial[0], 'alias_used': target_text}
    if len(partial) > 1:
        return {'matched': False, 'reason': 'ambiguous', 'candidates': partial}
    return {'matched': False, 'reason': 'no_match'}


def ensure_pending_dir():
    PENDING_PATH.parent.mkdir(parents=True, exist_ok=True)


def save_pending(record):
    ensure_pending_dir()
    with open(PENDING_PATH, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2)


def load_pending():
    if not PENDING_PATH.exists():
        return None
    with open(PENDING_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def clear_pending():
    if PENDING_PATH.exists():
        PENDING_PATH.unlink()


def call_webhook(payload):
    data = json.dumps(payload).encode('utf-8')
    req = request.Request(WEBHOOK_URL, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    with request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode('utf-8'))


def format_reply(result):
    # Prefer a clean presentation prepared by n8n. This prevents raw JSON from
    # leaking into Telegram and lets workflows add icons/formatting centrally.
    if result.get('success') and result.get('message'):
        return result['message']

    intent = result.get('intent')
    if not result.get('success'):
        err = result.get('error', 'unknown_error')
        data = result.get('data') or {}
        if err == 'confirmation_required':
            return 'Confirmation required before I can do that.'
        if err == 'vm_not_found':
            return 'I could not find that VM.'
        if err == 'already_running':
            return f"`{data.get('name', 'VM')}` (VMID {data.get('vmid', '?')}) is already running."
        if err == 'already_stopped':
            return f"`{data.get('name', 'VM')}` (VMID {data.get('vmid', '?')}) is already stopped."
        if err == 'vm_not_running':
            return f"`{data.get('name', 'VM')}` (VMID {data.get('vmid', '?')}) is not running, so reboot cannot proceed."
        return f'Action failed: {err}'

    if intent == 'list_vm_status':
        lines = ['🖥️ VM status summary:']
        for vm in result.get('data', []):
            icon = '🟢' if vm.get('status') == 'running' else '🔴' if vm.get('status') == 'stopped' else '🟡'
            if any(k in vm for k in ['ram_used', 'cpu_usage', 'uptime']):
                lines.append(f"{icon} {vm.get('vmid')} {vm.get('name')}: {vm.get('status')}")
                lines.append(f"   🧠 RAM: {vm.get('ram_used', '-')} / {vm.get('ram_total', '-')} ({vm.get('ram_usage', '-')})")
                lines.append(f"   ⚙️ CPU: {vm.get('cpu_usage', '-')} | Cores: {vm.get('cpu_cores', '-')}")
                lines.append(f"   ⏱️ Uptime: {vm.get('uptime', '-')}")
            else:
                lines.append(f"{icon} {vm.get('vmid')} {vm.get('name')}: {vm.get('status')}")
        return '\n'.join(lines)
    if intent == 'get_vm_status':
        d = result['data']
        return f"`{d['name']}` (VMID {d['vmid']}) is {d['status']}."
    if intent == 'get_all_vm_ips':
        lines = ['🌐 VM IPs:']
        for vm in result.get('data', []):
            icon = '🟢' if vm.get('status') == 'running' else '🔴' if vm.get('status') == 'stopped' else '🟡'
            ip = vm.get('ipv4') or vm.get('ip') or vm.get('note') or 'unknown'
            lines.append(f"{icon} {vm.get('vmid')} {vm.get('name')}: {ip}")
        return '\n'.join(lines)
    if intent in ('diagnose_vm_resources', 'safe_patch_vm', 'create_vm_snapshot', 'rollback_vm_snapshot', 'recover_ghost_vm', 'cleanup_idle_vms'):
        d = result.get('data', {})
        return result.get('message') or f"{intent.replace('_', ' ').capitalize()} completed for `{d.get('name', 'VM')}`."
    if intent in ('start_vm', 'stop_vm', 'reboot_vm'):
        d = result['data']
        action = d.get('action', '').replace('_requested', '').replace('_', ' ')
        return f"{action.capitalize()} started for `{d['name']}` (VMID {d['vmid']})."
    return json.dumps(result)


def handle_confirm(raw_text, user_id, user_name, chat_id):
    pending = load_pending()
    if not pending:
        return {'reply': 'There is no pending action to confirm.', 'called_webhook': False}
    t = normalize(raw_text)
    if t in ('cancel', 'no'):
        clear_pending()
        return {'reply': 'Cancelled.', 'called_webhook': False}
    if t not in ('yes', 'confirm'):
        return {'reply': 'Reply `yes` to continue or `cancel` to stop.', 'called_webhook': False}
    if str(pending['user_id']) != str(user_id) or str(pending['chat_id']) != str(chat_id):
        return {'reply': 'This confirmation does not match the original requester.', 'called_webhook': False}
    payload = pending['payload']
    payload['confirmed'] = True
    result = call_webhook(payload)
    clear_pending()
    return {'reply': format_reply(result), 'called_webhook': True, 'result': result}


def handle_message(raw_text, user_id='unknown', user_name='unknown', chat_id='unknown'):
    t = normalize(raw_text)
    if t in ('yes', 'confirm', 'cancel', 'no'):
        return handle_confirm(raw_text, user_id, user_name, chat_id)

    parsed = parse_intent(raw_text)
    if not parsed:
        return {'reply': 'I can help with: list VM status, check one VM status, get all VM IPs, diagnose VM resources, recover unreachable VM, idle VM cleanup, snapshots, safe patching, start/stop/reboot VM.', 'called_webhook': False}

    vms = load_aliases()
    target = None
    target_text = None
    if parsed['target_required']:
        target_text = extract_target_text(raw_text, parsed['intent'])
        resolved = resolve_target(target_text, vms)
        if not resolved.get('matched'):
            if resolved.get('reason') == 'ambiguous':
                cands = '\n'.join([f"- {v['canonical_name']} ({v['vmid']})" for v in resolved['candidates']])
                return {'reply': f"I found multiple matches for `{target_text}`:\n{cands}\nReply with the exact VM name or VMID.", 'called_webhook': False}
            return {'reply': f"I could not match `{target_text}` to a known VM.", 'called_webhook': False}
        vm = resolved['target']
        target = {
            'canonical_name': vm['canonical_name'],
            'vmid': vm['vmid'],
            'node': vm['node'],
            'proxmox_name': vm['proxmox_name'],
            'alias_used': target_text,
        }

    payload = {
        'source': 'openclaw',
        'channel': 'telegram',
        'request_id': f'req_{uuid.uuid4().hex[:12]}',
        'user_id': str(user_id),
        'user_name': user_name,
        'chat_id': str(chat_id),
        'raw_text': raw_text,
        'intent': parsed['intent'],
        'target': target,
        'confirmed': False,
        'requires_confirmation': parsed['state_changing'],
        'detail': bool(parsed.get('detail')),
    }

    if parsed['state_changing']:
        save_pending({'user_id': str(user_id), 'chat_id': str(chat_id), 'payload': payload})
        action_label = parsed['intent'].replace('_', ' ')
        return {'reply': f"⚠️ Confirmation required: {action_label} for `{target['canonical_name']}` (VMID {target['vmid']}) on node `{target['node']}`. Reply `yes` to continue or `cancel`.", 'called_webhook': False, 'pending': True}

    result = call_webhook(payload)
    return {'reply': format_reply(result), 'called_webhook': True, 'result': result}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--text', required=True)
    parser.add_argument('--user-id', default='manual-user')
    parser.add_argument('--user-name', default='manual-user')
    parser.add_argument('--chat-id', default='manual-chat')
    parser.add_argument('--json', action='store_true', help='Print full debug JSON instead of Telegram-ready reply text')
    args = parser.parse_args()
    out = handle_message(args.text, args.user_id, args.user_name, args.chat_id)
    if args.json:
        json.dump(out, sys.stdout, indent=2)
        print()
    else:
        # Default is clean Telegram-safe output only. No raw webhook JSON, no
        # command traces, no internal execution details.
        print(out.get('reply', ''))


if __name__ == '__main__':
    main()
