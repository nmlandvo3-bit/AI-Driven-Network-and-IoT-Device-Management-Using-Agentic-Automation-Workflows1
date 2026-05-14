const items=$input.all(); const first=items[0]?.json||{}; const rows=items.map(i=>i.json).filter(r=>String(r.status||'').toLowerCase()==='open'); const chat_id=first.chat_id||''; const lines=rows.slice(0,20).map((r,i)=>`${i+1}. ${r.employee_name || 'Unknown Employee'}
Case ID: ${r.case_id}
Department: ${r.department}
Service: ${r.service_requested || r.service || ''}
Issue: ${r.issue_description || r.description || ''}
Status: ${r.status}`); return [{json:{chat_id,reply:rows.length?`Open Cases:

${lines.join('\n\n')}`:'No open cases found.'}}];
