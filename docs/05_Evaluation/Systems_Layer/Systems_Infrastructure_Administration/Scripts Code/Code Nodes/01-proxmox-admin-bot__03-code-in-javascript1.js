// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Code in JavaScript1
// Node type: n8n-nodes-base.code

let cmd = ($json.command ?? "").trim().toLowerCase();
const rawText = $json.rawText || cmd;

// Natural-language bridge into the new OpenClaw Proxmox Orchestrator.
if (/(slow|lag|lagging|performance|cpu|ram|memory|diagnose|diagnostic|why)/.test(cmd) && /(ubuntu|test|vm|machine)/.test(cmd)) {
  cmd = 'diagnose vm 105';
}
if (/(idle|unused|cleanup|clean up|save resources|old vms)/.test(cmd)) {
  cmd = 'cleanup vms';
}
if (/(cannot access|can't access|cant access|unreachable|not responding|app down|server down|service down)/.test(cmd)) {
  cmd = 'recover vm 105';
}

const structuredPatterns = [
  /^help$/,
  /^node status$/,
  /^list vms$/,
  /^recent errors$/,
  /^recent tasks$/,
  /^start vm\s+\S+/,
  /^stop vm\s+\S+/,
  /^reboot vm\s+\S+/,
  /^check updates\s+\S+/,
  /^update\s+\S+/,
  /^diagnose vm\s+\S+/,
  /^cleanup vms$/,
  /^recover vm\s+\S+/
];

const isStructured = structuredPatterns.some(p => p.test(cmd));
return [{ json: { command: cmd, rawText, chatId: $json.chatId, userId: $json.userId, username: $json.username, isStructured } }];
