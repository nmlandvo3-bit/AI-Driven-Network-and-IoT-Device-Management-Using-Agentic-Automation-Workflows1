// Workflow: OpenClaw Proxmox Orchestrator (LDOfaQU10lYbt2Yy)
// Node: Parse OpenClaw Request
// Node type: n8n-nodes-base.code

const body = $json.body || $json;

function firstText(...vals) {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
  }
  return '';
}

const rawText = firstText(
  body.raw_text,
  body.chatInput,
  body.input,
  body.text,
  typeof body.message === 'string' ? body.message : '',
  body.prompt,
  body.query,
  body.command,
  body.body?.raw_text,
  body.body?.chatInput,
  body.body?.input,
  body.body?.text,
  typeof body.body?.message === 'string' ? body.body.message : '',
  body.message?.text,
  body.event?.text,
  body.update?.message?.text
);

let intent = String(body.intent || '').trim();
let target = body.target ?? body.vmid ?? body.name ?? body.label ?? null;
let confirmed = !!body.confirmed;
let requiresConfirmation = !!body.requires_confirmation;
let intentSource = intent ? 'structured_intent' : 'natural_language';

const text = rawText.toLowerCase()
  .replace(/[.,!?;:]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// Natural-language confirmation words for future approval flows.
if (!confirmed && /^(yes|yeah|yebo|yep|ok|okay|approved|approve|confirm|confirmed|do it|proceed)$/i.test(rawText.trim())) {
  confirmed = true;
}

function cleanTarget(s) {
  if (!s) return null;
  let t = String(s).trim();
  t = t.replace(/^(vm|machine|server|host)\s+/i, '');
  t = t.replace(/\s+(please|now)$/i, '');
  t = t.replace(/[^A-Za-z0-9_. -]/g, '').trim();
  return t || null;
}

function targetAfter(patterns) {
  for (const p of patterns) {
    const m = rawText.match(p);
    if (m && m[1]) return cleanTarget(m[1]);
  }
  return null;
}

if (!intent) {
  // Ghost VM/app unreachable and idle cleanup.
  if (/(cannot access|can't access|cant access|unreachable|not responding|app down|server down|service down|people cannot access)/.test(text)) {
    intent = 'recover_ghost_vm';
  }
  else if (/(idle|unused|cleanup|clean up|resource saving|save resources|old vms|waste)/.test(text) && /(vm|vms|machine|machines|lab|proxmox|server|servers)/.test(text)) {
    intent = 'cleanup_idle_vms';
  }
  // Safe patching / snapshot / rollback intents.
  if (/(safe|safely|patch|update|upgrade)/.test(text) && /(ubuntu|test|n8n|server|vm|machine|host)/.test(text)) {
    intent = 'safe_patch_vm';
  }
  else if (/(create|take|make)/.test(text) && /(snapshot|backup|restore point|safety point)/.test(text)) {
    intent = 'create_vm_snapshot';
  }
  else if (/(rollback|roll back|revert|restore)/.test(text) && /(snapshot|backup|vm|machine|server|ubuntu|test)/.test(text)) {
    intent = 'rollback_vm_snapshot';
  }
  // Resource diagnostics for one VM, e.g. "Ubuntu Test is slow", "check CPU/RAM of Ubuntu Test".
  else if (/(slow|lag|lagging|crash|crashing|freeze|freezing|resource|resources|ram|memory|cpu|disk|diagnose|diagnostic|why|performance|bottleneck)/.test(text) && /(ubuntu|test|n8n|server|vm|machine|host|gns|windows|desktop)/.test(text) && !/(all|every|summary of all)/.test(text)) {
    intent = 'diagnose_vm_resources';
  }
  // Detailed inventory/health summary with RAM, CPU, uptime, disk/network counters.
  else if (!intent && /(?:detail|details|detailed|full|complete|summary|information|info|resources|resource|ram|memory|cpu|usage|utilization)/.test(text) && !/\b(start|stop|shutdown|reboot|restart|reset|power on|power off|safe|safely|patch|update|upgrade)\b/.test(text)) {
    intent = 'list_vm_status';
    body.detail = true;
  }
  // IP discovery: tolerate typos like "vs" for "vms" and natural wording.
  else if (!intent && /(?:ip|ips|address|addresses)/.test(text) && /(vm|vms|vs|machine|machines|server|servers|host|hosts|all)/.test(text)) {
    intent = 'get_all_vm_ips';
  }
  // Explicit all-VM inventory/status.
  else if (!intent && /(?:list|show|check|get|display)/.test(text) && /(vm|vms|machine|machines|server|servers)/.test(text) && /(status|statuses|state|states|running|stopped|inventory|list)/.test(text)) {
    intent = 'list_vm_status';
  }
  // One VM status.
  else if (!intent && /(?:status|state|running|\bup\b|\bdown\b|health)/.test(text) && /(vm|machine|server|host|ubuntu|gns|windows|n8n|proxmox|test|desktop)/.test(text)) {
    intent = 'get_vm_status';
  }
  else if (!intent && /\b(start|power on|turn on|boot)\b/.test(text)) {
    intent = 'start_vm';
  }
  else if (!intent && /\b(stop|shutdown|shut down|power off|turn off)\b/.test(text)) {
    intent = 'stop_vm';
  }
  else if (!intent && /\b(reboot|restart|reset)\b/.test(text)) {
    intent = 'reboot_vm';
  }
}

if (!target) {
  target = targetAfter([
    /(?:status|state|health)\s+(?:of|for)?\s*(?:the)?\s*(.+)$/i,
    /(?:start|stop|shutdown|reboot|restart|reset|boot)\s+(?:the)?\s*(.+)$/i,
    /(?:vm|machine|server|host)\s+(?:called|named)?\s*(.+)$/i,
    /(?:ubuntu\s*test|ubuntutest|mlab\s*test|mlab-test|n8n\s*server|gns3|gns3-vm|ubuntu\s*desktop|windows|wineleven)/i
  ]);
  // If targetAfter matched the whole known-name regex, use the actual match.
  if (!target) {
    const known = rawText.match(/(ubuntu\s*test|ubuntutest|mlab\s*test|mlab-test|n8n\s*server|mlabubuntuserv|gns3-vm107|gns3|ubuntu\s*desktop|ubuntuDesk24\.04|wineleven|windows)/i);
    if (known) target = cleanTarget(known[1]);
  }
}

// Canonicalize common spoken labels to Proxmox labels where useful.
const canonical = {
  'ubuntu test': 'UbuntuTest',
  'ubuntutest': 'UbuntuTest',
  'mlab test': 'UbuntuTest',
  'mlab-test': 'UbuntuTest',
  'n8n server': 'MlabUbuntuServ',
  'mlabubuntuserv': 'MlabUbuntuServ',
  'gns3': 'GNS3-VM107',
  'gns3-vm': 'GNS3-VM107',
  'gns3-vm107': 'GNS3-VM107',
  'ubuntu desktop': 'UbuntuDesk24.04',
  'ubuntudesk24.04': 'UbuntuDesk24.04',
  'windows': 'WinEleven',
  'wineleven': 'WinEleven'
};
if (target) {
  const key = String(target).toLowerCase().replace(/\s+/g, ' ').trim();
  target = canonical[key] || target;
}

return [{ json: {
  source: body.source || 'openclaw',
  channel: body.channel || 'telegram',
  user_id: body.user_id || null,
  user_name: body.user_name || null,
  raw_text: rawText,
  intent,
  intent_source: intentSource,
  target,
  confirmed,
  requires_confirmation: requiresConfirmation,
  detail: !!(body.detail || body.detailed || /\b(detail|details|detailed|full|complete|summary|information|info|resources|resource|ram|memory|cpu|usage|utilization)\b/i.test(rawText)),
  request_id: body.request_id || null
}}];
