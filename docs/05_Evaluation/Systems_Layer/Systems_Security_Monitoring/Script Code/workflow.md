# n8n Workflow Description

## Overview

The AI Security Guard n8n workflow has two branches:

1. Telegram report request flow
2. Scheduled monitoring flow

Both branches collect logs from the Ubuntu endpoint `mlab-test` and send results to Telegram.

## Telegram Report Request Flow

```text
Telegram Trigger
→ AI Security Intent Agent
→ Parse AI Intent Output
→ If Telegram Report Request
→ Collect Chat Requested Logs
→ Build Chat Security Context
→ AI Risk Analyst
→ Send AI Risk Report
```

### Purpose

This branch lets the administrator ask natural-language questions through Telegram.

Example requests:

```text
report today
report last 1 hour
show warnings for employee2
which users need attention?
why was employee2 flagged?
```

### SSH Command

```javascript
{{ 'sudo -n /usr/local/sbin/collect-company-logs.sh ' + JSON.stringify($json.timeframe || 'today') }}
```

This command runs the collector script with the timeframe extracted from the administrator request.

## Scheduled Monitoring Flow

```text
Schedule Trigger
→ Normalize Scheduled Request
→ Collect Scheduled Logs
→ Parse Scheduled Security Context
→ If Scheduled Alert Needed
→ Build Scheduled Telegram Alert
→ AI Summarize Monitoring Alert
→ Send Scheduled Telegram Alert
```

### Purpose

This branch runs automatically at fixed intervals. It checks whether any user has crossed the administrator-review threshold.

If no user crosses the threshold, no Telegram alert is sent.

If a user reaches five or more violations, n8n sends a scheduled alert.

## AI Role

The AI does not directly execute Ubuntu commands.

The AI is used for:

- interpreting Telegram intent;
- converting requests into structured fields;
- summarizing structured evidence;
- explaining risk in plain English;
- recommending the next admin action.

The deterministic layer is responsible for detection.
