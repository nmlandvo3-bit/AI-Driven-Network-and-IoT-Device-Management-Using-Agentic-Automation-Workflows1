# Employee Issue Reporting Policy Validation

## Purpose

This subsection documents the **employee-facing issue reporting and policy validation workflow** used in the Network Layer evaluation.

Its purpose is to show how an employee can report a network-access problem through Telegram, how the workflow checks policy evidence before escalating the issue, and how the result is explained or logged for follow-up.

## Problem being solved

In a real network environment, not every access complaint is a fault. Some requests are blocked intentionally by policy, ACL design, firewall rules, or guest-network isolation. Without validation, every complaint could be forwarded to an administrator as if it were a break/fix issue.

This workflow reduces that ambiguity by:

- collecting the employee's report
- classifying the issue
- checking router ACL evidence
- checking firewall policy/rule evidence
- deciding whether the result is expected policy behavior, a likely network fault, or something that needs clarification

## Why this belongs under Network Layer evaluation

This section belongs under the **Network Layer** because the workflow validates network-access behavior using network enforcement evidence:

- router ACL evidence
- firewall policy/rule evidence
- department and VLAN access context
- employee connectivity/use-case descriptions

The workflow focuses on access validation, policy enforcement interpretation, and escalation decisions rather than general chat automation.

## Workflow overview

The main workflow is **Employee Network Case Logging**.

It receives Telegram issue reports from employees, classifies the problem, gathers policy evidence from supporting workflows, decides whether access is allowed or restricted, and either explains the result or logs a case for admin review.

## Relationship with Admin_Network_Operations_Bot and shared GNS3 topology

This folder documents the **employee-facing reporting and policy validation side** of the project.

The shared GNS3 topology used by the team is already documented in:

- `../Admin_Network_Operations_Bot/GNS3 Network Documentation/`

For that reason, this subsection **references** the shared topology rather than duplicating a separate topology folder here.

The related **Admin_Network_Operations_Bot** section documents the administrator-facing workflow, shared lab topology, and operational follow-up path after an employee case is escalated.

## Folder contents

| Path | Purpose |
| --- | --- |
| `README.md` | Main overview for this evaluation subsection |
| `SCENARIOS_AND_EXPECTATIONS.md` | Scenario-based expected behavior and evidence checklist |
| `Script_Codes/README.md` | Explains the extracted code/scripts and how they were organized |
| `Script_Codes/Python_Automation_Scripts/` | Python automation used by supporting policy-evidence workflows |
| `Script_Codes/Code_Nodes/` | Extracted JavaScript from n8n Code nodes |
| `n8n_workflows/README.md` | Explains the workflow JSON export folder |
| `n8n_workflows/*.workflow.json` | Exported workflow JSON files used in this subsection |

## Main workflow call chain

```text
Employee Telegram Message
→ Employee Network Case Logging
→ AI classification / parsing
→ Policy classification
→ get_firewall_rules_workflow
→ get_acl_list
→ Validate policy decision
→ Explain restriction / continue diagnostics / request clarification / log case
```

## Safety and validation logic

The workflow is designed to avoid incorrect escalation and avoid exposing raw network internals directly to end users.

Main validation controls include:

- classification of the employee report before policy checks are triggered
- use of firewall-policy evidence instead of guessing
- use of router ACL evidence instead of guessing
- request for clarification when identity or context is incomplete
- case logging only when the issue looks like a real network fault or needs admin review
- employee-facing responses that explain the outcome without exposing unnecessary raw ACL syntax

## Evidence sources

The decision logic in this subsection depends on three main evidence sources:

- **Router ACL evidence** from `get_acl_list`
- **Firewall policy/rule evidence** from `get_firewall_rules_workflow`
- **Employee Telegram issue report** from `Employee Network Case Logging`

## Expected decision outcomes

The documented workflow can reach these main outcomes:

- `policy_allowed`
- `policy_restricted`
- `clarification_needed`
- `network_issue`
- `case_logged_for_admin_review`

## Presentation note

This folder documents the employee-facing reporting and policy validation side of the Network Layer work.

The shared GNS3 topology is maintained in the related **Admin_Network_Operations_Bot** subsection, so this folder references that shared lab context rather than recreating it.
