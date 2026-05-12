// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Mlab Admin Main Router
// Node type: n8n-nodes-base.code

const msg = $json.message || {};
const chatId = msg.chat?.id || $json.chatId || '';
const userId = msg.from?.id || $json.userId || '';
const username = msg.from?.username || msg.from?.first_name || $json.username || 'admin';
const rawText = String(msg.text || $json.text || $json.rawText || '').trim();
const text = rawText.toLowerCase().replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ').trim();

const staticData = $getWorkflowStaticData('global');
if (!staticData.pending) staticData.pending = {};
const key = String(chatId || userId || 'default');

function supported(t) {
  return /(ubuntu|test|vm|vms|machine|machines|proxmox|server|servers|snapshot|rollback|safe|safely|patch|update|upgrade|slow|lag|performance|cpu|ram|memory|disk|idle|cleanup|clean up|cannot access|unreachable|ip|ips|status|start|stop|reboot|restart)/.test(t);
}
function stateChanging(t) {
  return /(safe|safely|patch|update|upgrade|rollback|roll back|revert|start|stop|reboot|restart|reset|shutdown|power off|power on)/.test(t);
}
function intentHint(t) {
  if (/(safe|safely|patch|update|upgrade)/.test(t) && /(ubuntu|test|vm|machine|server)/.test(t)) return 'safe_patch_vm';
  if (/(slow|lag|lagging|performance|cpu|ram|memory|disk|diagnose|diagnostic|why)/.test(t)) return 'diagnose_vm_resources';
  if (/(cannot access|unreachable|not responding|app down|server down|service down|people cannot access)/.test(t)) return 'recover_ghost_vm';
  if (/(idle|unused|cleanup|clean up|save resources|old vms|waste)/.test(t)) return 'cleanup_idle_vms';
  if (/(create|take|make)/.test(t) && /(snapshot|backup|restore point)/.test(t)) return 'create_vm_snapshot';
  if (/(rollback|roll back|revert|restore)/.test(t)) return 'rollback_vm_snapshot';
  if (/(ip|ips|address|addresses)/.test(t)) return 'get_all_vm_ips';
  if (/(list|show|status|statuses|details|detailed|info|information)/.test(t) && /(vm|vms|machine|machines|server|servers)/.test(t)) return 'list_vm_status';
  if (/\bstart\b|power on|turn on|boot/.test(t)) return 'start_vm';
  if (/\bstop\b|shutdown|shut down|power off|turn off/.test(t)) return 'stop_vm';
  if (/\breboot\b|restart|reset/.test(t)) return 'reboot_vm';
  return '';
}
function targetHint(t) {
  if (/(ubuntu\s*test|ubuntutest|mlab\s*test|mlab-test|\b105\b)/.test(t)) return { vmid: '105', proxmox_name: 'UbuntuTest', canonical_name: 'ubuntu-test-vm' };
  const m = t.match(/\b(10[2-7])\b/);
  if (m) return { vmid: m[1] };
  return null;
}
function payload(confirmed=false) {
  return {
    source: 'mlab-admin-telegram',
    channel: 'telegram',
    user_id: String(userId),
    user_name: username,
    chat_id: String(chatId),
    raw_text: rawText,
    text: rawText,
    chatInput: rawText,
    intent: intentHint(text),
    target: targetHint(text),
    confirmed,
    requires_confirmation: stateChanging(text),
    request_id: `tg_${Date.now()}`
  };
}

if (/^(yes|y|yeah|yebo|yep|ok|okay|approved|approve|confirm|confirmed|go ahead|proceed|do it)$/i.test(rawText)) {
  const pending = staticData.pending[key];
  if (!pending) {
    return { json: { direct_reply: true, chatId, message: 'There is no pending Proxmox action to confirm.' } };
  }
  delete staticData.pending[key];
  pending.confirmed = true;
  pending.request_id = `tg_${Date.now()}`;
  return { json: { direct_reply: false, chatId, payload: pending } };
}
if (/^(no|cancel|stop|never mind|nevermind)$/i.test(rawText)) {
  delete staticData.pending[key];
  return { json: { direct_reply: true, chatId, message: 'Cancelled.' } };
}

if (!supported(text)) {
  return { json: { direct_reply: true, chatId, message: '🛠 *Mlab Admin*\n\nI can help with Proxmox VM operations:\n\n• `Ubuntu Test is slow`\n• `People cannot access Ubuntu Test`\n• `find idle VMs and suggest cleanup`\n• `create snapshot of Ubuntu Test`\n• `safely update Ubuntu Test`\n• `list VMs` / `get all VM IPs`\n• `start vm 105` / `stop vm 105` / `reboot vm 105`' } };
}

const p = payload(false);
if (p.requires_confirmation) {
  staticData.pending[key] = p;
  const action = (p.intent || 'requested action').replace(/_/g, ' ');
  return { json: { direct_reply: true, chatId, message: `⚠️ *Confirmation required*\n\nAction: ${action}\nTarget: ${p.target?.proxmox_name || p.target?.vmid || 'requested VM'}\n\nReply *yes* to continue or *cancel* to stop.` } };
}
return { json: { direct_reply: false, chatId, payload: p } };
