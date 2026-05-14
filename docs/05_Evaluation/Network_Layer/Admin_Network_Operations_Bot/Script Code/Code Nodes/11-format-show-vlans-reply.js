const data = $input.first().json;

// Handles both cases:
// 1. input is directly { status, vlan_count, vlans }
// 2. input is wrapped like { data: [...] } or array-like output
const result = Array.isArray(data)
  ? data[0]
  : Array.isArray(data.data)
    ? data.data[0]
    : data;

const status = result.status || 'unknown';
const vlanCount = result.vlan_count || (result.vlans ? result.vlans.length : 0);
const vlans = Array.isArray(result.vlans) ? result.vlans : [];

if (status !== 'success') {
  return [
    {
      json: {
        ...data,
        reply_text: `⚠️ Could not retrieve VLAN information.\n\nStatus: ${status}`
      }
    }
  ];
}

const importantVlans = vlans.filter(vlan => {
  const id = Number(vlan.vlan_id);
  return id < 1002; // hides Cisco legacy default VLANs 1002–1005
});

const lines = importantVlans.map(vlan => {
  const ports =
    vlan.interfaces && vlan.interfaces.length > 0
      ? vlan.interfaces.join(', ')
      : 'No access ports assigned';

  return `• VLAN ${vlan.vlan_id} — ${vlan.vlan_name}
  Status: ${vlan.status}
  Ports: ${ports}`;
});

const replyText = `📡 VLAN Summary

Status: ✅ Success
Total VLANs found: ${vlanCount}
Displayed VLANs: ${importantVlans.length}

${lines.join('\n\n')}`;

return [
  {
    json: {
      ...data,
      reply_text: replyText
    }
  }
];
