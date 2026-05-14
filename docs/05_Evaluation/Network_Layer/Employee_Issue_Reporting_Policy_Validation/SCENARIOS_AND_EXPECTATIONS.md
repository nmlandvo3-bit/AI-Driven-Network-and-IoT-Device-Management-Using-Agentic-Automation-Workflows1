# Scenarios and Expectations

## Scenario 1: Employee asks why Facebook is blocked

- **Goal**
  - Confirm whether the access issue is a valid policy restriction rather than a network failure
- **Example employee input**
  - `I am using the HR computer and I cannot access Facebook.`
- **Expected workflow path**
  - `Employee Network Case Logging` classifies the request as a policy-related access question
  - `get_firewall_rules_workflow` retrieves firewall policy/rule evidence
  - `get_acl_list` retrieves router ACL evidence if needed for final context
  - `Validate policy decision` determines whether the restriction matches company policy
- **Expected decision**
  - `policy_restricted`
- **Expected employee/admin response**
  - The employee receives an explanation that access is restricted by company policy if social-media access is blocked for that department
  - No unnecessary admin case should be created unless the evidence is unclear
- **Evidence required**
  - Employee Telegram message
  - Firewall policy/rule output
  - Final policy decision output
- **Safety expectation**
  - The workflow should not escalate the issue as a fault when the restriction is clearly policy-driven

## Scenario 2: Guest VLAN user cannot access internal server

- **Goal**
  - Confirm that guest-to-internal isolation is treated as expected restricted behavior when supported by policy evidence
- **Example employee input**
  - `I am connected as guest and cannot access the internal server.`
- **Expected workflow path**
  - Classified as `policy_check` or `network_issue` depending on wording and context
  - `get_acl_list` provides ACL evidence for guest isolation
  - `get_firewall_rules_workflow` provides supporting firewall evidence if needed
  - `Validate policy decision` explains whether the restriction is expected
- **Expected decision**
  - Usually `policy_restricted`
- **Expected employee/admin response**
  - The employee receives a clear explanation that guest network access to internal resources is restricted
  - Raw ACL syntax should not be exposed directly to the employee
- **Evidence required**
  - Employee Telegram message
  - ACL evidence
  - Final policy decision output
- **Safety expectation**
  - The workflow should explain the restriction without leaking unnecessary low-level ACL details

## Scenario 3: Employee cannot reach another department from their department (both departments have no restriction)

- **Goal**
  - Distinguish a genuine connectivity problem from a policy restriction
- **Example employee input**
  - `I'm using the Finance pc and I cannot reach the HR department`
- **Expected workflow path**
  - Classified as `network_issue`
  - Policy evidence may still be checked to rule out a restriction
  - If the problem is not policy-related, the workflow collects required contact details
  - `Build Case Record` logs the case for admin review
- **Expected decision**
  - `network_issue` followed by `case_logged_for_admin_review`
- **Expected employee/admin response**
  - The employee is asked for any missing identity/contact details if needed
  - A case record is created for the admin-side workflow to review
- **Evidence required**
  - Employee Telegram message
  - Validation result showing the issue is not policy-restricted
  - Case record output/logged row
- **Safety expectation**
  - The workflow should avoid incorrectly blaming policy when the traffic should be allowed

## Scenario 4: Non-network/general chat message

- **Goal**
  - Ensure the workflow stays helpful without triggering unnecessary network validation steps
- **Example employee input**
  - `Hello, what can you help me with?`
- **Expected workflow path**
  - Classified as `general_chat`
  - The bot responds with supported help scope
  - Policy workflows are not called unnecessarily
- **Expected decision**
  - General guidance response rather than a network-policy decision
- **Expected employee/admin response**
  - The bot explains it can help report network access issues, policy restrictions, and connectivity problems
  - No admin case is created
- **Evidence required**
  - Employee Telegram message
  - Workflow execution showing no unnecessary policy-check child workflow call
- **Safety expectation**
  - The workflow should avoid wasting evidence calls on irrelevant conversation
