// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: VM List
// Node type: n8n-nodes-base.code

const vms = $json.data || [];

if (!vms.length) {
  return [{
    json: {
      chatId: $json.chatId,
      message: "⚠️ No VMs found on the cluster."
    }
  }];
}

const lines = vms.map(vm => {
  const statusIcon = vm.status === 'running' ? '🟢' : '🔴';
  return `${statusIcon} VMID: ${vm.vmid}\n   Name: ${vm.name || 'unnamed'}\n   Node: ${vm.node}\n   Status: ${vm.status}`;
});

const message = `📦 *Proxmox Virtual Machines*\n\n${lines.join('\n\n')}`;

return [{
  json: {
    chatId: $json.chatId,
    message
  }
}];

