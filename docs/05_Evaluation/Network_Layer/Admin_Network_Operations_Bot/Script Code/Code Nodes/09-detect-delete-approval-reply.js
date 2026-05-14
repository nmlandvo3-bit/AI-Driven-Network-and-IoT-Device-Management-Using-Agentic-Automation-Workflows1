const prepare = $('Prepare Message').first().json;

const text = String(
  prepare.text ||
  prepare.message_text ||
  prepare.original_text ||
  prepare.raw_text ||
  ''
).trim();

const normalized = text.toUpperCase();

const rows = $input.all().map(item => item.json);

const pending = rows.find(row =>
  String(row.approval_status || '').toLowerCase() === 'pending' &&
  String(row.action_type || '').toLowerCase() === 'delete_vlan'
) || {};

const hasPendingDelete = !!pending.action_id;

const isApprove = ['YES', 'Y'].includes(normalized);
const isReject = ['NO', 'N', 'CANCEL', 'STOP'].includes(normalized);
const isApprovalWord = isApprove || isReject;

let approvalDecision = null;

if (isApprove) approvalDecision = 'approved';
if (isReject) approvalDecision = 'rejected';

let route = 'normal_command';

if (hasPendingDelete && isApprovalWord) {
  route = 'approval_reply';
} else if (hasPendingDelete && !isApprovalWord) {
  route = 'pending_block';
} else if (!hasPendingDelete && isApprovalWord) {
  route = 'orphan_approval';
}

return [
  {
    json: {
      ...prepare,

      route,

      has_pending_delete: hasPendingDelete,
      is_approval_reply: isApprovalWord,
      approval_decision: approvalDecision,

      pending_action_id: pending.action_id || null,
      pending_action_type: pending.action_type || null,
      pending_vlan_id: pending.vlan_id || null,
      pending_vlan_name: pending.vlan_name || null,
      pending_status: pending.approval_status || null,
      pending_requested_at: pending.created_at || pending.createdAt || null
    }
  }
];
