// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Validate VMID2
// Node type: n8n-nodes-base.code

// --- 1. Get VMID from the Parse Command node ---
const vmid = String($node["Parse Command"].json.target);

// --- 2. Read HTTP Request response safely ---
const responseItem = $input.all()[0].json;
const vms = Array.isArray(responseItem.data)
  ? responseItem.data
  : [];

// --- 3. Find VM ---
const match = vms.find(vm => String(vm.vmid) === vmid);

// --- 4. VM not found → ERROR ---
if (!match) {
  return [{
    json: {
      chatId: $node["Parse Command"].json.chatId,
      error: true,
      message:
        `❌ VM ID ${vmid} does not exist.\n\n` +
        `Available VM IDs:\n` +
        vms.map(v => `• ${v.vmid} — ${v.name}`).join('\n')
    }
  }];
}

// --- 5. VM exists → enrich context ---
return [{
  json: {
    ...$node["Parse Command"].json,
    vmExists: true,
    vmid: vmid,
    vmName: match.name,
    vmNode: match.node,
    vmStatus: match.status,
    vmType: match.type
  }
}];

