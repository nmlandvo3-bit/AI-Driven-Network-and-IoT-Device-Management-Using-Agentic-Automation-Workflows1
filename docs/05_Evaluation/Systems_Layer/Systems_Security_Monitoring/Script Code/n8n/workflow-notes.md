# n8n Workflow Notes

## Node Summary

### Telegram Report Request Branch

1. **Telegram Trigger** receives administrator messages.
2. **AI Security Intent Agent** interprets natural-language intent.
3. **Parse AI Intent Output** converts AI output into valid JSON.
4. **If Telegram Report Request** routes valid report requests to log collection and unrelated messages to the help response.
5. **Collect Chat Requested Logs** runs the collector through SSH.
6. **Build Chat Security Context** parses structured collector output.
7. **AI Risk Analyst** converts structured evidence into a Telegram-ready report.
8. **Send AI Risk Report** sends the report to Telegram.

### Scheduled Monitoring Branch

1. **Schedule Trigger** runs at a configured interval.
2. **Normalize Scheduled Request** sets the default timeframe.
3. **Collect Scheduled Logs** runs the collector through SSH.
4. **Parse Scheduled Security Context** parses the collector output.
5. **If Scheduled Alert Needed** checks whether any user needs administrator review.
6. **Build Scheduled Telegram Alert** builds alert context.
7. **AI Summarize Monitoring Alert** summarizes the alert.
8. **Send Scheduled Telegram Alert** sends the alert to Telegram.

## SSH Command

```javascript
{{ 'sudo -n /usr/local/sbin/collect-company-logs.sh ' + JSON.stringify($json.timeframe || 'today') }}
```

## AI Prompt Principles

- Use only the provided evidence.
- Do not invent users, commands, counts, malware, or compromise.
- Do not list users with zero violations unless the admin asks for all users.
- Distinguish warning-level activity from users needing administrator review.
- Say policy warnings are not confirmed malware when relevant.
- Keep Telegram output concise and readable.

## Unknown User Handling

If the administrator asks about a user not present in `perUserCounts`, the AI should not generate a fake report. It should reply that the user is not monitored and list available users.
