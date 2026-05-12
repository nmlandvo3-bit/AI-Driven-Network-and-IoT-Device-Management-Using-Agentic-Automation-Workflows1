// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Code in JavaScript
// Node type: n8n-nodes-base.code

const msg = $json.message;
const text = (msg?.text || "").trim().toLowerCase();

return [{
  json: {
    chatId: msg.chat.id,
    userId: msg.from.id,
    username: msg.from.username || msg.from.first_name,
    rawText: msg.text,
    command: text,
  }
}];

