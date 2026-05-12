// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Format Orchestrator Reply
// Node type: n8n-nodes-base.code

const r = $json;
return [{ json: { chatId: $("Parse Command").item.json.chatId, message: r.message || r.reply_text || JSON.stringify(r) } }];
