// Workflow name: get_firewall_rules_workflow
// Code node name: Get Firewall Rules
// Source: n8n export
// Purpose: Formats firewall-policy evidence returned to the main workflow.

const raw = $json.stdout || "";

let parsed;

try {
  parsed = JSON.parse(raw);
} catch (e) {
  parsed = {
    status: "error",
    message: raw || "Invalid script output",
    blocked_sites: []
  };
}

const sites = parsed.blocked_sites || [];


return {
  json: {
    status: parsed.status,
    count: sites.length,
    blocked_sites: sites,
  }
};
