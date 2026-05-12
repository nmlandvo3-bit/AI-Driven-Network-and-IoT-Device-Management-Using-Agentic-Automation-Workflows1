// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Code in JavaScript6
// Node type: n8n-nodes-base.code

const reply = String($json.rawText || "").trim().toLowerCase();

if (reply !== "yes") {
  return [{
    json: {
      ...$json,
      cancelled: true,
      message: "❌ Update cancelled. No changes made."
    }
  }];
}

return [{
  json: {
    ...$json,
    confirmed: true
  }
}];

