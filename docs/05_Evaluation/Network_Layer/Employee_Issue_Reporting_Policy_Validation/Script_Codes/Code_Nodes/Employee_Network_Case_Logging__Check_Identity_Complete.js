// Workflow name: Employee Network Case Logging
// Code node name: Check Identity Complete
// Source: n8n export
// Purpose: Checks whether enough identity details were collected before logging a case.

const name = $json.employee_name || "";
const empNum = $json.employee_number || "";
const email = $json.email || "";
const department = $json.department || "";

const missing = [];
if (!name) missing.push("your full name");
if (!empNum) missing.push("your employee number");
if (!email) missing.push("your email address");
if (!department) missing.push("your department");

return {
  json: {
    ...$json,
    identity_complete: missing.length === 0,
    missing_fields: missing
  }
};
