// Workflow name: Employee Network Case Logging
// Code node name: Build Policy Snapshot Topology
// Source: n8n export
// Purpose: Builds the policy/topology context used before final policy validation.

const currentDepartment = ($node["Parse AI Output"].json["department"] || "").trim();
const currentRequestedService = ($node["Parse AI Output"].json["requested_service"] || "").trim();
const currentIssueSummary = ($node["Parse AI Output"].json["issue_summary"] || "").trim();
const currentUserMessage = ($node["Extract Telegram Message"].json["user_message"] || "").trim();

const departmentMap = {
  HR: {
    aliases: ["hr", "human resources", "hr department", "hr network", "hr vlan", "hr subnet", "hr-pc", "vlan10", "vlan10 hr"],
    subnetPrefixes: ["192.168.10."],
    vlanIds: [10]
  },
  Finance: {
    aliases: ["finance", "accounting", "finance department", "finance network", "finance vlan", "finance subnet", "finance-pc", "vlan20", "vlan20 finance"],
    subnetPrefixes: ["192.168.20."],
    vlanIds: [20]
  },
  IT: {
    aliases: ["it", "it department", "admin network", "it vlan", "it subnet", "it-pc", "vlan30", "vlan30 it"],
    subnetPrefixes: ["192.168.30."],
    vlanIds: [30]
  },
  Staff: {
    aliases: ["staff", "staff department", "staff vlan", "staff subnet", "staff-pc", "vlan40", "vlan40 staff"],
    subnetPrefixes: ["192.168.40."],
    vlanIds: [40]
  },
  Servers: {
    aliases: ["servers", "server", "server network", "servers vlan", "servers subnet", "vlan50", "vlan50 servers", "ubuntu server", "hr server", "finance server", "it server", "dmz"],
    subnetPrefixes: ["192.168.50."],
    vlanIds: [50]
  },
  Mgmt_Internal: {
    aliases: ["mgmt_internal", "management internal", "internal management", "vlan60", "vlan60 mgmt", "mgmt internal"],
    subnetPrefixes: ["192.168.60."],
    vlanIds: [60]
  },
  Guest: {
    aliases: ["guest", "guest department", "guest network", "guest vlan", "guest subnet", "guest-pc", "guest-pc1", "guest pc", "vlan70", "vlan70 guest"],
    subnetPrefixes: ["192.168.70."],
    vlanIds: [70]
  },
  Mgmt: {
    aliases: ["mgmt", "management", "management vlan", "vlan99", "vlan99 mgmt"],
    subnetPrefixes: ["192.168.99."],
    vlanIds: [99]
  }
};

const BLOCKED_EXTERNAL_SITES = [
  "facebook",
  "facebook.com",
  "instagram",
  "instagram.com",
  "whatsapp",
  "whatsapp.com",
  "youtube",
  "youtube.com",
  "twitter",
  "twitter.com",
  "x",
  "x.com"
];

const GUEST_ISOLATED_FROM = ["HR", "Finance", "IT", "Staff", "Servers", "Mgmt_Internal", "Mgmt"];

const serviceAliases = {
  facebook: ["facebook", "fb", "facebook.com"],
  youtube: ["youtube", "yt", "youtube.com"],
  instagram: ["instagram", "instagram.com"],
  whatsapp: ["whatsapp", "whatsapp.com"],
  twitter: ["twitter", "twitter.com"],
  x: ["x.com", " x ", " x", "x "],
  google: ["google"],
  netflix: ["netflix", "netflix.com"],
  ubuntu_server: ["ubuntu server", "ubuntu_server", "ubuntu", "server"],
  hr: ["hr", "hr server", "hr pc", "hr-pc", "vlan10"],
  finance: ["finance", "finance server", "finance pc", "finance-pc", "vlan20"],
  it: ["it", "it server", "it pc", "it-pc", "vlan30"],
  staff: ["staff", "staff department", "staff pc", "staff-pc", "vlan40", "vlan40 staff"],
  servers: ["servers", "server", "server network", "vlan50", "ubuntu server"],
  guest: ["guest", "guest department", "guest pc", "guest-pc", "guest-pc1", "vlan70"],
  internet: ["internet", "web", "website", "online"],
  vpn: ["vpn"],
  dns: ["dns"],
  printer: ["printer", "printer server", "print server"]
};

const blockedExternalServices = ["facebook", "instagram", "whatsapp", "youtube", "twitter", "x"];

function canon(v) {
  return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const userMsg = canon(currentUserMessage);
const reqService = canon(currentRequestedService);
const issueMsg = canon(currentIssueSummary);

function textHasAlias(text, alias) {
  const t = ` ${canon(text)} `;
  const a = canon(alias);

  if (!a) return false;

  // single-character aliases must match as a whole token only
  if (a.length === 1) {
    return t.includes(` ${a} `);
  }

  return t.includes(` ${a} `) || t.includes(` ${a}.`) || t.includes(` ${a}/`) || t.includes(` ${a}-`);
}

function detectDepartment(text) {
  const value = canon(text);
  if (!value) return "";

  for (const [department, config] of Object.entries(departmentMap)) {
    if ((config.aliases || []).some(alias => textHasAlias(value, alias))) return department;
    if ((config.vlanIds || []).some(id => value.includes(`vlan ${id}`) || value.includes(`vlan${id}`))) return department;
    if ((config.subnetPrefixes || []).some(prefix => String(text || "").includes(prefix))) return department;
  }
  return "";
}

function mapIpToDepartment(ip) {
  const raw = String(ip || "").trim();
  if (!raw) return "";

  for (const [department, config] of Object.entries(departmentMap)) {
    if ((config.subnetPrefixes || []).some(prefix => raw.startsWith(prefix))) return department;
  }
  return "";
}

function normalizeService(service, message, extraText = "") {
  const parts = [service, message, extraText].filter(Boolean);

  for (const [key, aliases] of Object.entries(serviceAliases)) {
    for (const alias of aliases) {
      if (parts.some(part => textHasAlias(part, alias))) {
        return key;
      }
    }
  }

  return "";
}

function wildcardToPrefix(wildcard) {
  const octets = String(wildcard || "").split(".").map(v => Number(v));
  if (octets.length !== 4 || octets.some(v => Number.isNaN(v) || v < 0 || v > 255)) return null;

  const maskBits = octets.map(o => (255 - o).toString(2).padStart(8, "0")).join("");
  return maskBits.split("").filter(bit => bit === "1").length;
}

function extractAclSpecs(line) {
  const specs = [];
  for (const match of line.matchAll(/\bhost\s+((?:\d{1,3}\.){3}\d{1,3})/gi)) {
    specs.push({ type: "host", ip: match[1], raw: match[0] });
  }
  for (const match of line.matchAll(/((?:\d{1,3}\.){3}\d{1,3})\s+((?:\d{1,3}\.){3}\d{1,3})/g)) {
    specs.push({
      type: "subnet",
      ip: match[1],
      wildcard: match[2],
      prefix: wildcardToPrefix(match[2]),
      raw: `${match[1]} ${match[2]}`
    });
  }
  if (/\bany\b/i.test(line)) specs.push({ type: "any", raw: "any" });
  return specs;
}

function serviceLabel() {
  return currentRequestedService || currentUserMessage || currentIssueSummary || "that service";
}

const requestedDepartment =
  detectDepartment(currentDepartment) ||
  detectDepartment(currentUserMessage) ||
  detectDepartment(currentIssueSummary) ||
  "";

const normalizedRequestedService =
  normalizeService(currentRequestedService, currentUserMessage, currentIssueSummary);

const toolItems = [];

try {
  const fwItems = $items("Call 'get_firewall_rules_workflow'1", 0, 0);
  if (Array.isArray(fwItems)) {
    for (const item of fwItems) {
      if (item && item.json) toolItems.push(item.json);
    }
  }
} catch (e) {}

try {
  const aclItems = $items("Call 'get_acl_list'1", 0, 0);
  if (Array.isArray(aclItems)) {
    for (const item of aclItems) {
      if (item && item.json) toolItems.push(item.json);
    }
  }
} catch (e) {}

const snapshot = {
  department: currentDepartment,
  effective_department: requestedDepartment || currentDepartment || "",
  requested_service: currentRequestedService,
  normalized_requested_service: normalizedRequestedService,
  user_message: currentUserMessage,
  issue_summary: currentIssueSummary,
  firewall_sources: [],
  acl_sources: [],
  raw_policy_items: toolItems
};

for (const j of toolItems) {
  if (Array.isArray(j.blocked_sites)) {
    for (const site of j.blocked_sites) {
      const siteName =
        typeof site === "string"
          ? site
          : (
              site.site ||
              site.name ||
              site.destination ||
              site.platform ||
              site.service ||
              site.object_name ||
              String(site)
            );

      snapshot.firewall_sources.push({
        source_ip: "",
        raw_destination: siteName,
        normalized_service: normalizeService(siteName, "", JSON.stringify(site)),
        mapped_department: "",
        status: "DENIED",
        raw: site
      });
    }
  }

  if (Array.isArray(j.logs)) {
    for (const log of j.logs) {
      const srcIp = log.user || log.srcip || log.source_ip || "";
      const dstName = log.destination || log.platform || log.service || log.raw_ip || "";

      snapshot.firewall_sources.push({
        source_ip: srcIp,
        raw_destination: dstName,
        normalized_service: normalizeService(dstName, "", JSON.stringify(log)),
        mapped_department: mapIpToDepartment(srcIp) || detectDepartment(JSON.stringify(log)),
        status: log.status || "",
        raw: log
      });
    }
  }

  const aclText = String(j.clean_message || j.output || j.message || "");
  if (!aclText) continue;

  const lines = aclText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .filter(line => !line.startsWith("📋 ACL Report"));

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (!(lower.includes("permit") || lower.includes("deny") || lower.includes("access list") || lower.includes("acl"))) continue;

    const specs = extractAclSpecs(line);
    const sourceSpec = specs[0] || null;
    const destinationSpec = specs[1] || null;

    snapshot.acl_sources.push({
      line,
      action: lower.includes("deny") ? "deny" : lower.includes("permit") ? "permit" : "unknown",
      source_spec: sourceSpec,
      destination_spec: destinationSpec,
      source_department: (sourceSpec && mapIpToDepartment(sourceSpec.ip)) || detectDepartment(line),
      destination_department: (destinationSpec && mapIpToDepartment(destinationSpec.ip)) || detectDepartment(line.replace(sourceSpec?.raw || "", "")),
      normalized_service: normalizeService(currentRequestedService, currentUserMessage, line)
    });
  }
}

const requestedDept = (snapshot.effective_department || snapshot.department || "").trim();
const requestedService = (snapshot.requested_service || "").trim();
const normalizedService = (snapshot.normalized_requested_service || "").trim();
const firewallSources = snapshot.firewall_sources || [];
const aclSources = snapshot.acl_sources || [];

function isBlockedExternalService() {
  return (
    blockedExternalServices.includes(normalizedService) ||
    BLOCKED_EXTERNAL_SITES.some(s => textHasAlias(currentRequestedService, s) || textHasAlias(currentUserMessage, s))
  );
}

function isInternalTarget() {
  return (
    GUEST_ISOLATED_FROM.some(dept =>
      textHasAlias(currentRequestedService, dept) ||
      textHasAlias(currentUserMessage, dept) ||
      textHasAlias(currentIssueSummary, dept)
    ) ||
    ["ubuntu_server", "hr", "finance", "it", "staff", "servers"].includes(normalizedService)
  );
}

function isInternalStyle() {
  return isInternalTarget() ||
    /server|ubuntu|internal|department|hr|finance|guest|it|staff/i.test(`${requestedService} ${currentUserMessage} ${currentIssueSummary}`);
}

const confirmedFirewallBlock = firewallSources.some(entry =>
  (entry.status || "").toUpperCase() === "DENIED" &&
  entry.normalized_service === normalizedService
);

const rawFirewallMatch =
  blockedExternalServices.includes(normalizedService) &&
  firewallSources.some(entry => {
    const rawDest = canon(entry.raw_destination || "");
    if (!rawDest || rawDest.length < 4) return false;
    if (!reqService || reqService.length < 4) return false;

    return (
      userMsg.includes(rawDest) ||
      reqService.includes(rawDest) ||
      rawDest.includes(reqService)
    );
  });

const firewallConfirmedBlock =
  blockedExternalServices.includes(normalizedService) &&
  (confirmedFirewallBlock || rawFirewallMatch);

const isGuestSourceDept =
  requestedDept.toLowerCase() === "guest" ||
  /\bguest\s*(pc|network|department|device|vlan)?\b/i.test(currentUserMessage);

const nonGuestInternalTargets = ["HR", "Finance", "IT", "Staff", "Servers", "Mgmt_Internal", "Mgmt"];

const isTargetingNonGuestInternal = nonGuestInternalTargets.some(dept =>
  textHasAlias(currentRequestedService, dept) ||
  textHasAlias(currentUserMessage, dept) ||
  textHasAlias(currentIssueSummary, dept)
);

const isGuestAsTarget =
  !isGuestSourceDept &&
  !!requestedDept &&
  /\bguest\b/i.test(`${currentRequestedService} ${currentUserMessage} ${currentIssueSummary}`) &&
  !isTargetingNonGuestInternal;

const isGuestToInternal = isGuestSourceDept && isTargetingNonGuestInternal;

const isInternalToInternal =
  !!requestedDept &&
  requestedDept.toLowerCase() !== "guest" &&
  isInternalTarget() &&
  !isGuestAsTarget &&
  !isBlockedExternalService();

const isServerAccessIssue =
  /ubuntu|server|servers|vlan50|192\.168\.50\./i.test(`${requestedService} ${currentUserMessage} ${currentIssueSummary}`) &&
  !!requestedDept &&
  requestedDept.toLowerCase() !== "guest";

const anyFirewallDenyForService = firewallSources.find(entry =>
  (entry.status || "").toUpperCase() === "DENIED" &&
  (!normalizedService || entry.normalized_service === normalizedService)
);

const relevantAcl = requestedDept
  ? aclSources.filter(entry =>
      String(entry.source_department || "").toLowerCase() === requestedDept.toLowerCase()
    )
  : aclSources;

const matchingAclDeny = relevantAcl.find(entry => {
  if (entry.action !== "deny") return false;
  if (!normalizedService) return true;
  if (entry.normalized_service === normalizedService) return true;

  if (["hr", "finance", "it", "staff", "guest", "servers"].includes(normalizedService) &&
      String(entry.destination_department || "").toLowerCase() === normalizedService.toLowerCase()) {
    return true;
  }

  if (normalizedService === "ubuntu_server" || normalizedService === "servers") {
    return /ubuntu|server|servers|192\.168\.50\.|vlan50/i.test(entry.line || "");
  }

  return false;
});

const matchingAclPermit = relevantAcl.find(entry => {
  if (entry.action !== "permit") return false;
  if (!normalizedService) return true;
  if (entry.normalized_service === normalizedService) return true;

  if (["hr", "finance", "it", "staff", "guest", "servers"].includes(normalizedService) &&
      String(entry.destination_department || "").toLowerCase() === normalizedService.toLowerCase()) {
    return true;
  }

  if (normalizedService === "ubuntu_server" || normalizedService === "servers") {
    return /ubuntu|server|servers|192\.168\.50\.|vlan50/i.test(entry.line || "");
  }

  return false;
});

let policy_decision = "unclear";
let confidence = "low";
let employee_safe_summary = "";
let admin_review_needed = true;
let needs_clarification = false;
let clarification_question = "";

if (firewallConfirmedBlock) {
  policy_decision = "restricted";
  confidence = "high";
  admin_review_needed = false;
  employee_safe_summary = `It looks like ${serviceLabel()} is blocked by the company's internet access policy, so it is not available from company devices right now.`;

} else if (isGuestToInternal) {
  policy_decision = "restricted";
  confidence = "high";
  admin_review_needed = false;
  employee_safe_summary = `Sorry, you're currently on the Guest network, so access to other company departments is not allowed for guest users. 😊`;

} else if (isGuestAsTarget) {
  policy_decision = "unclear";
  confidence = "low";
  admin_review_needed = true;
  employee_safe_summary = `There are no restrictions preventing ${requestedDept || "your department"} from reaching the Guest network. If connectivity is failing, this is likely a network issue that requires administrator investigation.`;

} else if (isServerAccessIssue) {
  policy_decision = "unclear";
  confidence = "low";
  admin_review_needed = true;
  employee_safe_summary = `There are no restrictions preventing ${requestedDept || "your department"} from accessing ${serviceLabel()}. This appears to be a connectivity or server availability issue that requires administrator investigation.`;

} else if (isInternalToInternal) {
  policy_decision = "unclear";
  confidence = "low";
  admin_review_needed = true;
  employee_safe_summary = `There are no restrictions between internal departments. If ${requestedDept} cannot reach ${serviceLabel()}, this is likely a network connectivity issue that requires administrator investigation.`;

} else if (!requestedDept && isInternalStyle()) {
  needs_clarification = true;
  admin_review_needed = false;
  employee_safe_summary = "I need a bit more information before I can check the access policy.";
  clarification_question = "Which department or network is this device in?";

} else if (matchingAclDeny) {
  policy_decision = "restricted";
  confidence = "high";
  admin_review_needed = false;
  employee_safe_summary = `${requestedDept} appears to be restricted from reaching ${serviceLabel()} under the current network access policy.`;

} else if (matchingAclPermit) {
  policy_decision = "allowed";
  confidence = "medium";
  admin_review_needed = false;
  employee_safe_summary = `${requestedDept} should be able to reach ${serviceLabel()} under the current policy. If it is still not working, this may be a connectivity issue that needs administrator investigation.`;

} else if (!requestedDept) {
  needs_clarification = true;
  admin_review_needed = false;
  employee_safe_summary = `I could not determine which department or network this device belongs to.`;
  clarification_question = "Which department or network is this device in?";

} else {
  policy_decision = "unknown";
  confidence = "low";
  admin_review_needed = true;
  employee_safe_summary = `I could not find a policy covering access to ${serviceLabel()} in the current firewall or network rules. This will be logged for administrator review.`;
}

return {
  json: {
    ...$json,
    department: requestedDept || currentDepartment,
    requested_service: currentRequestedService,
    normalized_requested_service: normalizedService,
    policy_snapshot: snapshot,
    policy_decision,
    confidence,
    employee_safe_summary,
    admin_review_needed,
    needs_clarification,
    clarification_question,
    policy_analysis: {
      requested_department: requestedDept,
      requested_service: requestedService,
      normalized_requested_service: normalizedService,
      firewall_hits: firewallSources.length,
      acl_hits: aclSources.length,
      any_firewall_deny_for_service: !!anyFirewallDenyForService,
      matched_acl_deny: !!matchingAclDeny,
      matched_acl_permit: !!matchingAclPermit,
      tool_items_found: toolItems.length,
      firewall_confirmed_block: firewallConfirmedBlock,
      is_guest_to_internal: isGuestToInternal,
      is_guest_as_target: isGuestAsTarget,
      is_server_access_issue: isServerAccessIssue,
      is_internal_to_internal: isInternalToInternal,
      is_guest_source_dept: isGuestSourceDept
    }
  }
};
