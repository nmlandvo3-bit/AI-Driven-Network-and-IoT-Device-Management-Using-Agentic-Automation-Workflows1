# Script Code

This folder contains the script evidence for the **Admin Network Operations Bot** evaluation write-up.

## What is included

- extracted **n8n Code node** logic from the main admin workflow
- a **sanitized Python VLAN automation script** used by the VLAN execution path
- a **Python README** explaining how the SSH/jump-based automation was used without exposing live credentials
- a **script inventory** that maps each extracted file back to its source node and purpose.

## Important rule followed here

This repository section must not store secrets, API keys, bot tokens, SSH private keys, or licensed images.

For that reason:

- credential values were removed from the Python copy
- live infrastructure secrets were summarized in the documentation rather than stored in files
- this folder is for **evaluation evidence**, not for production secret storage.
