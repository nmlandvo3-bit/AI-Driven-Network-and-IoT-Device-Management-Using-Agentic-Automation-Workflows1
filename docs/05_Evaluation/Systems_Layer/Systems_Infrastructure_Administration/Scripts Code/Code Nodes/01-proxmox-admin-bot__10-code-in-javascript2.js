// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Code in JavaScript2
// Node type: n8n-nodes-base.code

const vms = $json.data || [];

const vmList = vms.map(vm =>
  `• ${vm.vmid} — ${vm.name || 'unnamed'} (${vm.status})`
).join('\n');

const helpText = `
🛠 Proxmox Admin Bot — Commands

Available commands:
- help
- list vms
- start vm <vmid>
- stop vm <vmid>
- reboot vm <vmid>
- check updates <vmid>
- update <vmid>

📦 Available VMs:
${vmList || 'No VMs found'}
`;

return [{
  json: {
    chatId: $json.chatId,
    message: helpText
  }
}];

