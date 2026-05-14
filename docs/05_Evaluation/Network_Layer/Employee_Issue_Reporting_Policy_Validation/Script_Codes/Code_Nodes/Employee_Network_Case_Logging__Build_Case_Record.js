// Workflow name: Employee Network Case Logging
// Code node name: Build Case Record
// Source: n8n export
// Purpose: Builds the case record payload for admin-side review/logging.

const caseId = "CASE-" + Date.now();
const requestedService = String($json.requested_service || '').toLowerCase();
const issueType = String($json.issue_type || '').toLowerCase();
const issueSummary = String($json.issue_summary || $json.user_message || '').toLowerCase();
const intent = String($json.intent || '').toLowerCase();
const combined = `${requestedService} ${issueType} ${issueSummary}`;

let category = 'network';
if (intent === 'policy_check' || /policy|access denied|blocked|restricted|firewall|acl|permission/.test(combined)) {
  category = 'security_policy';
} else if (/ubuntu|server|server unreachable|internal server|server access/.test(combined)) {
  category = 'server';
} else if (/youtube|facebook|instagram|tiktok|internet|website|web|browser/.test(combined)) {
  category = 'internet';
} else if (/vpn/.test(combined)) {
  category = 'vpn';
} else if (/dns/.test(combined)) {
  category = 'dns';
} else if (/printer/.test(combined)) {
  category = 'printer';
} else if (/application|app|software|system access/.test(combined)) {
  category = 'application_access';
}

return {
  json: {
    ...$json,
    case_id: caseId,
    created_at: new Date().toISOString(),
    employee_name: $json.employee_name || "",
    department: $json.department || "",
    employee_number: $json.employee_number || "",
    email: $json.email || "",
    requested_service: $json.requested_service || "",
    issue_type: $json.issue_type || "Access issue",
    issue_summary: $json.issue_summary || $json.user_message || "",
    category,
    status: "open",
    assigned_to: "Mlandvo",
    employee_reply: `Your issue has been logged successfully. Case ID: ${caseId}. The network administrator will review it and follow up after diagnosis.`
  }
};
