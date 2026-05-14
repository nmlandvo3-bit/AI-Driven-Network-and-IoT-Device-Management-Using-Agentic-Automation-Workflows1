const current = $input.first().json;

const parsed = $('Parse Admin JSON').first().json;
const prepared = $('Prepare Message').first().json;

const vlanId = current.vlan_id || parsed.vlan_id || '';
const vlanName = current.vlan_name || parsed.vlan_name || '';
const caseId = current.case_id || parsed.case_id || '';

return [
  {
    json: {
      action_id: 'ACT-' + Date.now(),
      chat_id: String(prepared.chat_id || ''),
      admin_name: prepared.user_name || prepared.user_id || '',
      case_id: caseId || '',
      action_type: 'delete_vlan',
      action_summary: `Delete VLAN ${vlanId || 'UNKNOWN'}`,
      approval_status: 'Pending',
      created_at: new Date().toISOString(),
      vlan_id: String(vlanId || ''),
      vlan_name: String(vlanName || '')
    }
  }
];
