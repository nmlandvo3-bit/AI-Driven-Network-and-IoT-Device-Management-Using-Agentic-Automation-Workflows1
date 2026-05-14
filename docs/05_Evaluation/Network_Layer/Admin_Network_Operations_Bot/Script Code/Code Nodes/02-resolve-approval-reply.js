const input = $input.first().json;

const approved = input.approval_decision === 'approved';

return [
  {
    json: {
      ...input,
      reply_text: approved
        ? `✅ Approved. Proceeding to delete VLAN ${input.pending_vlan_id}.`
        : `❌ Cancelled. VLAN ${input.pending_vlan_id} will not be deleted.`
    }
  }
];
