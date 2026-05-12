# Architecture

## High-Level Architecture

The AI Security Guard is built as a hybrid security monitoring workflow.

```text
Ubuntu endpoint logs
→ collector scripts
→ n8n orchestration
→ AI analysis
→ Telegram report or alert
```

The system separates detection from explanation:

- Linux logs and audit rules detect real activity.
- n8n validates inputs and controls execution.
- AI interprets administrator requests and explains evidence.
- Telegram delivers the final report to the administrator.

## Main Components

### Ubuntu Endpoint: `mlab-test`

The Ubuntu endpoint simulates a company-managed device. It contains multiple workplace-style users and groups. It generates logs when users attempt restricted actions.

### `auditd`

The Linux audit daemon monitors selected command executions and sensitive file changes. Rules are stored in:

```text
/etc/audit/rules.d/company-monitor.rules
```

### Custom Policy Warning Layer

The custom warning layer displays a warning when restricted users attempt selected actions such as software installation. It writes warning events to system logs.

### Collector Scripts

The collector scripts summarize Ubuntu logs into structured evidence. n8n calls the collector through SSH using:

```bash
sudo -n /usr/local/sbin/collect-company-logs.sh "last 1 hour"
```

### n8n Workflow

n8n controls the workflow logic. It decides whether to collect logs, parse security context, send a help message, or send a Telegram alert.

### AI Security Intent Agent

This agent interprets administrator Telegram messages and converts them into structured request data.

### AI Risk Analyst

This agent explains structured evidence in plain English. It does not execute commands and does not decide detection thresholds.

## Safety Design

The AI layer does not directly execute endpoint commands. The only endpoint command is the predefined collector command approved in the n8n SSH node. This limits risk and makes the workflow traceable.
