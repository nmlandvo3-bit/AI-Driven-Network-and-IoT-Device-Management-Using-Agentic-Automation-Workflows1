const rows = $input.all().map(i => i.json);
const req = $items('Parse Admin JSON', 0, 0)[0]?.json || {};
const msg = $items('Prepare Message', 0, 0)[0]?.json || {};
const rawCaseId = String(req.case_id || '').trim().toUpperCase();
const normalizedCaseId = rawCaseId && !rawCaseId.startsWith('CASE-') ? `CASE-${rawCaseId}` : rawCaseId;
const requestedEmployeeName = String(req.employee_name || '').trim();
let resolvedCaseId = normalizedCaseId;
if (!resolvedCaseId && requestedEmployeeName) {
  const needle = requestedEmployeeName.toLowerCase();
  const candidates = rows.filter(r => String(r.employee_name || '').trim().toLowerCase() === needle);
  const fuzzy = candidates.length ? candidates : rows.filter(r => String(r.employee_name || '').trim().toLowerCase().includes(needle) || needle.includes(String(r.employee_name || '').trim().toLowerCase()));
  const ordered = [...fuzzy].sort((a,b) => {
    const ao = String(a.status || '').toLowerCase() === 'open' ? 0 : 1;
    const bo = String(b.status || '').toLowerCase() === 'open' ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });
  if (ordered[0]?.case_id) resolvedCaseId = String(ordered[0].case_id).trim().toUpperCase();
}
const base = {
  admin_action: String(req.admin_action || '').trim(),
  requested_case_id: resolvedCaseId,
  requested_employee_name: requestedEmployeeName,
  requested_department: req.department || '',
  requested_status: req.status || '',
  requested_resolution: req.resolution || '',
  chat_id: msg.chat_id || req.chat_id || ''
};
if (['update_status','resolve_case'].includes(base.admin_action)) {
  return [{ json: base }];
}
if (!rows.length) return [{ json: base }];
return rows.map(r => ({ json: { ...r, ...base } }));
