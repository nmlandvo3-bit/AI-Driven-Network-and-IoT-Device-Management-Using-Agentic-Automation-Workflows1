const items=$input.all(); const first=items[0]?.json||{}; const reqCaseId=first.requested_case_id; const chat_id=first.chat_id||''; const row=items.map(i=>i.json).find(r=>r.case_id===reqCaseId); return [{json:{chat_id,reply:row?`Case Details

Case ID: ${row.case_id}
Employee: ${row.employee_name}
Employee ID: ${row.employee_id}
Department: ${row.department}
Email: ${row.email}
Service/System: ${row.service_requested || row.service || ''}
Issue Type: ${row.issue_type}
Status: ${row.status}
Priority: ${row.priority || ''}

Description:
${row.issue_description || row.description || ''}

Created At:
${row.created_at}`:`Case ${reqCaseId} was not found.`}}];
