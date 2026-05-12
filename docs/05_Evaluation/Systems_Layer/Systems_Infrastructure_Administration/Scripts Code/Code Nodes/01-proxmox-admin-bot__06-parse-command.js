// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Parse Command
// Node type: n8n-nodes-base.code

const text = ($json.command ?? "").trim().toLowerCase();

// Tokenize
const parts = text.split(/\s+/);

const action = parts[0];        // help, list, start, stop, etc.
const subject = parts[1] || ""; // vm, vms, node
const target = parts[2] || "";  // vmid or name

return [{
  json: {
    ...$json,
    action,
    subject,
    target
  }
}];

