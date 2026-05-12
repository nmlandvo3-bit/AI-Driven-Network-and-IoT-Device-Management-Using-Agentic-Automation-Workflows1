// Workflow: Sub-Proxmox-Safe-Patching (thsz2pCu12NxVYfB)
// Node: Format Safe Patch Result
// Node type: n8n-nodes-base.code

const snap = $('Create Safety Snapshot').first().json;
const out = String($json.stdout || '').trim();
const failed = /failed/i.test(out) && !/0 loaded units listed/i.test(out);
const lines=[];
lines.push(`🛡️ *Safe Patching Complete — ${snap.name || snap.target || 'VM'}*`);
lines.push(`📸 Snapshot: ${snap.snapshot || 'created'}`);
lines.push('');
lines.push('✅ Update command completed and health checks ran.');
if (failed) lines.push('⚠️ Some failed services may need review.');
lines.push('');
lines.push('```');
lines.push(out.split('\n').slice(-80).join('\n'));
lines.push('```');
lines.push('');
lines.push('If the VM behaves badly after this, request rollback using the snapshot name above.');
return [{ json: { success: true, intent: 'safe_patch_vm', target: snap.name || snap.target, snapshot: snap.snapshot, message: lines.join('\n'), patch_output: out } }];
