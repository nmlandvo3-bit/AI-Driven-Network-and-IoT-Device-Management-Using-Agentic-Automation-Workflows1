const items = $input.all();
const ctx = $items('Attach Case Context', 0, 0)[0]?.json || $items('Resolve Case', 0, 0)[0]?.json || {};
const resolveRow = $items('Resolve Case', 0, 0)[0]?.json || {};
const rawCaseId = String(ctx.requested_case_id || resolveRow.case_id || ctx.case_id || '').trim().toUpperCase();
const caseId = rawCaseId && !rawCaseId.startsWith('CASE-') ? `CASE-${rawCaseId}` : rawCaseId;
const row = items.map(i => i.json).find(r => String(r.case_id || '').trim().toUpperCase() === caseId) || resolveRow;
return [{
  json: {
    ...row,
    ...ctx,
    case_id: caseId || row?.case_id || '',
    employee_email: row?.email || ctx?.email || '',
    employee_name: row?.employee_name || ctx?.employee_name || 'User',
    issue_description: row?.issue_description || row?.description || ctx?.issue_description || ctx?.description || '',
    service_requested: row?.service_requested || row?.service || ctx?.service_requested || ctx?.service || '',
    resolution: ctx?.requested_resolution || ctx?.resolution || row?.resolution || ''
  }
}];
