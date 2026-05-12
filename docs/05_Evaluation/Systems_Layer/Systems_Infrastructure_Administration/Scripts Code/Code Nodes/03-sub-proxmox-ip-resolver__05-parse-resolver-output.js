// Workflow: Sub-Proxmox-IP-Resolver (6H9qIGjGiO4vME8i)
// Node: Parse Resolver Output
// Node type: n8n-nodes-base.code

const stdout = String($json.stdout || '').trim();
const start = stdout.indexOf('{');
const end = stdout.lastIndexOf('}');
if (start === -1 || end === -1 || end < start) {
  return { json: { success: false, error: 'no_json_from_ssh', stdout } };
}
try {
  const parsed = JSON.parse(stdout.slice(start, end + 1));
  return { json: parsed };
} catch (e) {
  return { json: { success: false, error: 'json_parse_failed', message: e.message, stdout } };
}
