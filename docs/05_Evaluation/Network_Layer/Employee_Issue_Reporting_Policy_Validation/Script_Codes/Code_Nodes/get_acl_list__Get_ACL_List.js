// Workflow name: get_acl_list
// Code node name: Get ACL List
// Source: n8n export
// Purpose: Formats router ACL evidence returned to the main workflow.

const raw = $json.stdout || "";

let parsed;

try {
  parsed = JSON.parse(raw);
} catch (e) {
  parsed = {
    status: "error",
    output: raw
  };
}

const output = parsed.output || "";

const lines = output
  .split("\n")
  .map(line => line.trim())
  .filter(line =>
    line &&
    !line.startsWith("show access-lists") &&
    !line.startsWith("R2#")
  );

let message = "📋 ACL Report from R2\n\n";

if (parsed.status !== "success") {
  message += `❌ Status: ERROR\n`;
  message += `Message: ${parsed.message || output || "Unknown error"}`;
} else if (lines.length === 0) {
  message += "No ACL entries found.";
} else {
  for (const line of lines) {
    if (line.startsWith("Extended IP access list")) {
      message += `\n🔐 ${line}\n`;
    } else if (line.includes("deny ip")) {
      message += `⛔ ${line}\n`;
    } else if (line.includes("permit ip")) {
      message += `✅ ${line}\n`;
    } else {
      message += `• ${line}\n`;
    }
  }
}

return {
  json: {
    status: parsed.status || "success",
    clean_message: message
  }
};
