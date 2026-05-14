// Workflow name: Employee Network Case Logging
// Code node name: Extract Contact Details
// Source: n8n export
// Purpose: Extracts employee identity/contact details from follow-up messages.

const text = ($json.user_message || "").trim();

// Existing values from earlier nodes
let employee_name = ($json.employee_name || "").trim();
let employee_number = ($json.employee_number || "").trim();
let email = ($json.email || "").trim();
let department = ($json.department || "").trim();

// ---------- 1. LABELED FIELD MATCHES ----------
const labeledName =
  text.match(/name\s*[:\-]\s*(.+)/i);

const labeledEmp =
  text.match(/employee\s*(number|id)\s*[:\-]\s*([A-Za-z0-9-]+)/i);

const labeledEmail =
  text.match(/email\s*[:\-]\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);

const labeledDept =
  text.match(/department\s*[:\-]\s*(finance|hr|it|guest|staff|servers|management|admin)/i);

const labeledIssue =
  text.match(/issue\s*[:\-]\s*(.+)/i);

// ---------- 2. GENERIC EMAIL / EMPLOYEE NUMBER ----------
const genericEmail =
  text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

const genericEmp =
  text.match(/\b[A-Z]{2,}-\d{4,}-\d{3,}\b/i) ||
  text.match(/\b[A-Z]{2,}-\d{3,}\b/i);

// ---------- 3. DEPARTMENT ----------
const genericDept =
  text.match(/\b(finance|hr|it|guest|staff|servers|management|admin)\b/i);

// ---------- 4. "MY NAME IS ..." ----------
const explicitName =
  text.match(/my name is\s+([A-Za-z]+(?:\s+[A-Za-z]+)+)/i);

// ---------- 5. SLASH-SEPARATED FORMAT ----------
// Example:
// Luhlelo Dube / FIN-2025-001 / luhlelodube@gmail.com / Finance / I cannot access...
const slashParts = text
  .split("/")
  .map(s => s.trim())
  .filter(Boolean);

if (slashParts.length >= 4) {
  if (!employee_name && slashParts[0]) employee_name = slashParts[0];
  if (!employee_number && slashParts[1]) employee_number = slashParts[1];
  if (!email && slashParts[2] && /@/.test(slashParts[2])) email = slashParts[2];
  if (!department && slashParts[3]) department = slashParts[3];
}

// ---------- 6. PLAIN MULTILINE FORMAT ----------
// Example:
// Welcome Nkambule
// HR-2025-001
// hualiguideaiproject@gmail.com
// HR
// I cannot access facebook on this pc
const lines = text
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean);

if (lines.length >= 4) {
  const maybeName = lines[0];
  const maybeEmp = lines[1];
  const maybeEmail = lines[2];
  const maybeDept = lines[3];

  if (!employee_name && /^[A-Za-z]+(?:\s+[A-Za-z]+)+$/.test(maybeName)) {
    employee_name = maybeName;
  }

  if (!employee_number && /\b[A-Z]{2,}-\d{4,}-\d{3,}\b/i.test(maybeEmp)) {
    employee_number = maybeEmp;
  }

  if (!email && /@/.test(maybeEmail)) {
    email = maybeEmail;
  }

  if (
    !department &&
    /^(finance|hr|it|guest|staff|servers|management|admin)$/i.test(maybeDept)
  ) {
    department = maybeDept;
  }
}

// ---------- 7. FALLBACK ASSIGNMENTS ----------
if (!employee_name && labeledName) {
  employee_name = labeledName[1].trim();
}
if (!employee_name && explicitName) {
  employee_name = explicitName[1].trim();
}

if (!employee_number && labeledEmp) {
  employee_number = labeledEmp[2].trim();
}
if (!employee_number && genericEmp) {
  employee_number = genericEmp[0].trim();
}

if (!email && labeledEmail) {
  email = labeledEmail[1].trim();
}
if (!email && genericEmail) {
  email = genericEmail[0].trim();
}

if (!department && labeledDept) {
  department = labeledDept[1].trim();
}
if (!department && genericDept) {
  department = genericDept[1].trim();
}

// ---------- 8. OPTIONAL ISSUE EXTRACTION ----------
let issue_from_reply = "";
if (labeledIssue) {
  issue_from_reply = labeledIssue[1].trim();
} else if (slashParts.length >= 5) {
  issue_from_reply = slashParts.slice(4).join(" / ").trim();
} else if (lines.length >= 5) {
  issue_from_reply = lines.slice(4).join(" ").trim();
}

return {
  json: {
    ...$json,
    employee_name,
    employee_number,
    email,
    department,
    user_message: issue_from_reply || $json.user_message || ""
  }
};
