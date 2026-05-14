// Workflow name: Employee Network Case Logging
// Code node name: Validate policy decision
// Source: n8n export
// Purpose: Combines employee context with ACL and firewall evidence to reach a decision.

let final_reply = "";
let escalate_policy_case = false;
let needs_clarification = false;

// Check if identity is already complete
const hasName = String($json.employee_name || "").trim().length > 0;
const hasEmpNum = String($json.employee_number || "").trim().length > 0;
const hasEmail = String($json.email || "").trim().length > 0;
const hasDept = String($json.department || "").trim().length > 0;
const identityComplete = hasName && hasEmpNum && hasEmail && hasDept;

if ($json.policy_decision === "restricted") {
  // Clear policy evidence — tell the employee directly, no case needed
  final_reply =
    $json.employee_safe_summary ||
    "Access appears to be restricted by current company policy.";
  escalate_policy_case = false;

} else if ($json.policy_decision === "allowed") {
  // Policy says allowed — might still be a technical issue
  final_reply =
    $json.employee_safe_summary ||
    "Access appears to be allowed under the current company policy. If it is still failing, it may be a technical issue.";
  escalate_policy_case = false;

} else if ($json.needs_clarification) {
  // Need more info before checking policy
  final_reply =
    $json.clarification_question ||
    "I need a bit more information before I can confirm the policy.";
  escalate_policy_case = false;
  needs_clarification = true;

} else if ($json.admin_review_needed && identityComplete) {
  // Policy unclear or network issue AND we already have all identity details
  // Skip asking for identity — go straight to logging
  final_reply = "";
  escalate_policy_case = true;

} else if ($json.admin_review_needed && !identityComplete) {
  // Policy unclear or network issue but identity is incomplete — ask for it
  final_reply =
    ($json.employee_safe_summary ||
      "I could not confirm the current policy confidently.") +
    " If needed, I can send this for administrator review.";
  escalate_policy_case = true;

} else {
  final_reply =
    ($json.employee_safe_summary ||
      "I could not confirm the current policy confidently.") +
    " If needed, I can send this for administrator review.";
  escalate_policy_case = true;
}

return {
  json: {
    ...$json,
    final_reply,
    escalate_policy_case,
    needs_clarification,
    identity_complete: identityComplete
  }
};
