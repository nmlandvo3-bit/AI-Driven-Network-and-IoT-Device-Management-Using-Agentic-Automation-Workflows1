# Test Cases

## Test Case 1: Clean Security Report

### Input

```text
report last 1 hour
```

### Expected Result

```text
No users needing administrator review.
No warning-level activity in the selected timeframe.
```

---

## Test Case 2: Warning-Level Activity Below Threshold

### Input

Run as `employee3`:

```bash
apt install nmap
apt install nmap
apt install nmap
```

### Expected Result

```text
employee3 has 3 policy warnings.
employee3 remains below the administrator-review threshold.
```

---

## Test Case 3: User Reaches Admin-Review Threshold

### Input

Run as `intern1`:

```bash
for i in 1 2 3 4 5; do apt install nmap; done
```

### Expected Result

```text
intern1 crosses the threshold.
The scheduled workflow sends a Telegram alert.
```

---

## Test Case 4: Specific User Report

### Input

```text
give me a report on intern1 activity
```

### Expected Result

```text
The report focuses only on intern1.
The AI explains intern1's policy-warning activity.
```

---

## Test Case 5: Normal Chat Message

### Input

```text
i sent this by mistake
```

### Expected Result

```text
The workflow does not collect logs.
The bot sends a help message with valid report examples.
```
