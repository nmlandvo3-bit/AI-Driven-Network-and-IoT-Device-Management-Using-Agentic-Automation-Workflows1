const items=$input.all(); const first=items[0]?.json||{}; const dept=String(first.requested_department||'').toLowerCase(); const chat_id=first.chat_id||''; const deptLabel=first.requested_department||''; const rows=items.map(i=>i.json).filter(r=>String(r.department||'').toLowerCase()===dept); const lines=rows.slice(0,20).map((r,i)=>`${i+1}. ${r.employee_name || 'Unknown Employee'}
Case ID: ${r.case_id}
Service: ${r.service_requested || r.service || ''}
Status: ${r.status}`); return [{json:{chat_id,reply:rows.length?`${deptLabel} Department Cases:

${lines.join('\n\n')}`:`No cases found for department ${deptLabel}.`}}];
