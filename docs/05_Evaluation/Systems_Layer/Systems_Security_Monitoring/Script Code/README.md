# AI Security Guard – Ubuntu Security Monitoring Workflow

## Overview

The AI Security Guard is the systems security monitoring component of the AI-driven infrastructure management project. It monitors a simulated company Ubuntu endpoint called `mlab-test` for policy-warning activity, unauthorized command attempts, and users who repeatedly attempt restricted actions.

The workflow combines Linux security logs, `auditd` audit rules, custom warning scripts, n8n automation, SSH-based log collection, Telegram notifications, and AI-generated security explanations.

The system does not rely on AI to blindly decide what is dangerous. Linux logs and deterministic rules detect the actual activity first. The AI layer then explains the evidence in plain English and recommends the next administrator action.

Core idea:

```text
Rules detect.
n8n validates and orchestrates.
AI interprets and explains.
Telegram delivers the report.
