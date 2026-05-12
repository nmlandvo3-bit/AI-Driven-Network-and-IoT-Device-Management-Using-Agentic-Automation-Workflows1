// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Code in JavaScript5
// Node type: n8n-nodes-base.code

const stdout = $json.stdout || "";

// remove the "Listing..." line, keep package lines
const updates = stdout
  .split("\n")
  .map(l => l.trim())
  .filter(l => l && !l.startsWith("Listing"));

return [{
  json: {
    ...$json,
    updatesAvailable: updates.length > 0,
    updatesCount: updates.length,
    updatesList: updates.join("\n"),
  }
}];

