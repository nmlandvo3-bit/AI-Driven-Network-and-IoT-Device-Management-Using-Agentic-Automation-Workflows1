// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Code in JavaScript4
// Node type: n8n-nodes-base.code

const text = ($json.message?.text || "").trim();

if (!text.startsWith("ssh ")) {
  return [{
    json: {
      chatId: $json.chat.id,
      error: true,
      message: "❌ Expected: ssh <username> <password>"
    }
  }];
}

const [, user, pass] = text.split(/\s+/);

if (!user || !pass) {
  return [{
    json: {
      chatId: $json.chat.id,
      error: true,
      message: "❌ Invalid SSH format.\nUse: ssh <user> <password>"
    }
  }];
}

return [{
  json: {
    sshUser: user,
    sshPass: pass,
    chatId: $json.chat.id
  }
}];

