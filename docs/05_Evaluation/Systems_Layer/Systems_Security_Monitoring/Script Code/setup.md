# Setup Guide

This guide documents the Ubuntu-side setup for the AI Security Guard security monitoring workflow.

## 1. Install Required Packages

```bash
sudo apt update
sudo apt install auditd audispd-plugins -y
sudo systemctl enable --now auditd
```

## 2. Create Company Groups

```bash
sudo groupadd company-admins || true
sudo groupadd company-employees || true
sudo groupadd company-interns || true
sudo groupadd company-contractors || true
sudo groupadd policy-violators || true
```

## 3. Assign Users to Groups

```bash
sudo usermod -aG company-admins mlab-admin
sudo usermod -aG company-admins employee1
sudo usermod -aG company-employees employee2
sudo usermod -aG company-employees employee3
sudo usermod -aG company-interns intern1
sudo usermod -aG company-contractors contractor1
```

## 4. Install Scripts

```bash
sudo cp scripts/collect-company-logs.sh /usr/local/sbin/collect-company-logs.sh
sudo cp scripts/check-policy-violations.sh /usr/local/sbin/check-policy-violations.sh
sudo cp scripts/company-warning /usr/local/bin/company-warning

sudo chmod 750 /usr/local/sbin/collect-company-logs.sh
sudo chmod 750 /usr/local/sbin/check-policy-violations.sh
sudo chmod 755 /usr/local/bin/company-warning

sudo chown root:root /usr/local/sbin/collect-company-logs.sh
sudo chown root:root /usr/local/sbin/check-policy-violations.sh
sudo chown root:root /usr/local/bin/company-warning
```

## 5. Install Audit Rules

```bash
sudo cp audit/company-monitor.rules /etc/audit/rules.d/company-monitor.rules
sudo augenrules --load
sudo systemctl restart auditd
sudo auditctl -l
```

## 6. Allow n8n SSH User to Run Collector Without Password

Create a sudoers rule. Adjust the username if your n8n SSH user is different.

```bash
sudo tee /etc/sudoers.d/mlab-security-guard >/dev/null <<'SUDOEOF'
mlab-admin ALL=(root) NOPASSWD: /usr/local/sbin/collect-company-logs.sh, /usr/local/sbin/check-policy-violations.sh
SUDOEOF

sudo chmod 440 /etc/sudoers.d/mlab-security-guard
sudo visudo -cf /etc/sudoers.d/mlab-security-guard
```

## 7. Test Collector Manually

```bash
sudo -n /usr/local/sbin/collect-company-logs.sh today
sudo -n /usr/local/sbin/collect-company-logs.sh "last 1 hour"
sudo -n /usr/local/sbin/collect-company-logs.sh "last 5 days"
```
