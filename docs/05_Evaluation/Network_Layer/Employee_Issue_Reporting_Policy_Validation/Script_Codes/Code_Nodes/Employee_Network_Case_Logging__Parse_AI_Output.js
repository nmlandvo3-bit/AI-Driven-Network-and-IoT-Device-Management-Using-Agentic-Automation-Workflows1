// Workflow name: Employee Network Case Logging
// Code node name: Parse AI Output
// Source: n8n export
// Purpose: Parses the AI classification output into structured workflow decision data.

const raw =
  $json.output ??
  $json.text ??
  $json.response ??
  $json.result ??
  "";

let cleaned = String(raw).trim();

// Strip markdown fences
cleaned = cleaned
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/\s*```$/i, "");

// Extract real JSON — Ollama prepends tool trace ending with "]] "
const toolTraceEnd = cleaned.lastIndexOf("]] ");
if (toolTraceEnd !== -1) {
  cleaned = cleaned.slice(toolTraceEnd + 3).trim();
} else {
  // No tool trace — try newline-prefixed {
  const newlineBrace = cleaned.lastIndexOf("\n{");
  if (newlineBrace !== -1) {
    cleaned = cleaned.slice(newlineBrace).trim();
  } else {
    // Final fallback — first {
    const firstBrace = cleaned.indexOf("{");
    if (firstBrace > 0) {
      cleaned = cleaned.slice(firstBrace);
    }
  }
}

// Strip anything after the last }
const lastBrace = cleaned.lastIndexOf("}");
if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
  cleaned = cleaned.slice(0, lastBrace + 1);
}

let parsed = {};

try {
  parsed = JSON.parse(cleaned);
} catch (e) {
  parsed = {
    intent: "general_chat",
    department: "",
    employee_name: "",
    employee_number: "",
    email: "",
    requested_service: "",
    category: "",
    issue_type: "",
    issue_summary: "",
    needs_clarification: false,
    clarification_question: "",
    confidence: "low"
  };
}

const normalizeDepartment = (value = "") => {
  const key = String(value || "").trim().toLowerCase();
  const map = {
    finance: "Finance",
    hr: "HR",
    it: "IT",
    guest: "Guest",
    staff: "Staff",
    servers: "Servers",
    management: "Management",
    admin: "Admin"
  };
  return map[key] || String(value || "").trim();
};

if ($json.user_message) {
  const deptMatch = String($json.user_message).match(/\b(finance|hr|it|guest|staff|servers|management|admin)\b(?:\s+department)?/i);
  if (deptMatch) {
    parsed.department = normalizeDepartment(deptMatch[1]);
  } else if (parsed.department) {
    parsed.department = normalizeDepartment(parsed.department);
  }
} else if (parsed.department) {
  parsed.department = normalizeDepartment(parsed.department);
}

if (!String(parsed.category || "").trim()) {
  const msg = String($json.user_message || "").toLowerCase();
  const service = String(parsed.requested_service || "").toLowerCase();

  if (
    parsed.intent === "policy_check" ||
    msg.includes("blocked") ||
    msg.includes("allowed") ||
    msg.includes("access denied")
  ) {
    parsed.category = "security_policy";
  } else if (service.includes("server")) {
    parsed.category = "server";
  } else if (service.includes("vpn")) {
    parsed.category = "vpn";
  } else if (service.includes("dns")) {
    parsed.category = "dns";
  } else if (service.includes("printer")) {
    parsed.category = "printer";
  } else if (
    service.includes("internet") ||
    service.includes("wifi") ||
    service.includes("network")
  ) {
    parsed.category = "network";
  } else if (
    service.includes("youtube") ||
    service.includes("facebook") ||
    service.includes("google") ||
    service.includes("instagram") ||
    service.includes("tiktok")
  ) {
    parsed.category = "application_access";
  } else {
    parsed.category = "";
  }
}

return {
  json: {
    ...$json,
    ...parsed
  }
};
