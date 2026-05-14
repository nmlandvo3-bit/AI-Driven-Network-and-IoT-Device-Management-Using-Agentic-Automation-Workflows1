const raw = $json.output ?? $json;
let p;
try {
  p = typeof raw === 'object' ? raw : JSON.parse(String(raw).replace(/```json|```/g, '').trim());
} catch (e) {
  p = {
    admin_action: 'help',
    case_id: null,
    employee_name: null,
    department: null,
    status: null,
    resolution: null,
    vlan_id: null,
    vlan_name: null,
    router_name: null,
    config_type: null,
    reply_text: 'I can help with /show open cases, /show cases Finance, /view CASE-1777527657268, /diagnose Bruno Maseko, /update Bruno Maseko status In Progress, /resolve Bruno Maseko restored access, /show vlans, /get denied logs, /create vlan 80 Research, /delete vlan 80, or /backup R2.'
  };
}

const text = String($json.text || '').trim();
const actionAliases = {
  'resolve': 'resolve_case',
  'resolve case': 'resolve_case',
  'update': 'update_status',
  'update case': 'update_status',
  'diagnose': 'diagnose_case',
  'diagnose case': 'diagnose_case',
  'view': 'view_case',
  'view case': 'view_case',
  'show open': 'show_open_cases',
  'show open cases': 'show_open_cases',
  'check cases': 'show_open_cases',
  'check case': 'show_open_cases',
  'show cases': 'show_cases_by_department'
};
const normalizedActionKey = String(p.admin_action || '').trim().toLowerCase();
if (actionAliases[normalizedActionKey]) p.admin_action = actionAliases[normalizedActionKey];
if (!p.admin_action || p.admin_action === 'help') {
  const lower = text.toLowerCase();
  if (/^(?:\/)?resolve\b/.test(lower)) p.admin_action = 'resolve_case';
  else if (/^(?:\/)?update\b/.test(lower)) p.admin_action = 'update_status';
  else if (/^(?:\/)?diagnose\b/.test(lower)) p.admin_action = 'diagnose_case';
  else if (/^(?:\/)?view\b/.test(lower)) p.admin_action = 'view_case';
  else if (/^(?:\/)?show\s+open\s+cases\b/.test(lower) || /^(?:\/)?check\s+cases\b/.test(lower)) p.admin_action = 'show_open_cases';
  else if (/^(?:\/)?show\s+cases\s+\w+/.test(lower)) p.admin_action = 'show_cases_by_department';
  else if (/^(?:\/)?show\s+vlans\b/.test(lower)) p.admin_action = 'show_vlans';
  else if (/^(?:\/)?get\s+denied\s+logs\b/.test(lower)) p.admin_action = 'get_denied_logs';
  else if (/^(?:\/)?create\s+vlan\b/.test(lower)) p.admin_action = 'create_vlan';
  else if (/^(?:\/)?delete\s+vlan\b/.test(lower)) p.admin_action = 'delete_vlan';
  else if (/^(?:\/)?backup\b/.test(lower)) p.admin_action = 'backup_router_config';
}

const caseMatch = text.match(/\b(CASE-\d{6,})\b/i) || text.match(/\b(\d{10,})\b/);
if (caseMatch) {
  const extracted = String(caseMatch[1]).toUpperCase();
  p.case_id = extracted.startsWith('CASE-') ? extracted : `CASE-${extracted}`;
}

if (p.admin_action === 'update_status') {
  const updateMatch = text.match(/\bstatus\s+(.+)$/i);
  if (updateMatch) p.status = updateMatch[1].trim();
  if (!p.case_id) {
    const nameMatch = text.match(/^\s*(?:\/)?update\s+(.+?)\s+status\s+.+$/i);
    if (nameMatch) {
      let candidate = nameMatch[1].trim();
      candidate = candidate.replace(/^case\s+/i, '').replace(/^employee\s+/i, '').trim();
      if (candidate) p.employee_name = candidate;
    }
  }
}

if (p.admin_action === 'diagnose_case' && !p.case_id) {
  const diagNameMatch = text.match(/^\s*(?:\/)?diagnose(?:\s+case)?\s+(.+)$/i);
  if (diagNameMatch) {
    let candidate = diagNameMatch[1].trim();
    candidate = candidate.replace(/^case\s+/i, '').replace(/^employee\s+/i, '').trim();
    if (candidate) p.employee_name = candidate;
  }
}

if (p.admin_action === 'resolve_case') {
  const resolveWithCase = text.match(/\bresolve\s+(?:CASE-\d+|\d+)\s+(.+)$/i);
  const resolveByName = text.match(/^\s*(?:\/)?resolve\s+(.+?)\s+(.+)$/i);
  if (resolveWithCase) {
    p.resolution = resolveWithCase[1].trim();
  } else if (resolveByName) {
    let candidate = resolveByName[1].trim();
    candidate = candidate.replace(/^case\s+/i, '').replace(/^employee\s+/i, '').trim();
    if (!p.case_id && candidate) p.employee_name = candidate;
    if (!p.resolution) p.resolution = resolveByName[2].trim();
  }
}

const backupMatch = text.match(/backup(?:\s+router)?\s+(R\d+)(?:\s+(running|startup|both))?/i);
if (backupMatch) {
  p.router_name = backupMatch[1].toUpperCase();
  p.config_type = (backupMatch[2] || 'both').toLowerCase();
}

return { json: { ...$json, ...p } };
