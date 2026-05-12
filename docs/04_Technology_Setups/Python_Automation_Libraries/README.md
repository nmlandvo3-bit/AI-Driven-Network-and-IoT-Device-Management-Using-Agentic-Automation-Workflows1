# Python Automation Libraries Setup

## Purpose

Python libraries support automation tasks that are easier to perform outside n8n nodes, especially network device access, structured data collection, and IoT simulation.

## Main libraries

| Library | Use |
| --- | --- |
| Netmiko | SSH automation for network devices |
| NAPALM | Vendor-neutral network data retrieval/configuration |
| Paho-MQTT | MQTT publish/subscribe for IoT simulation |
| Requests | HTTP/API calls |
| Proxmoxer | Optional Python access to Proxmox API |

## Setup example

Create a virtual environment inside the relevant VM:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip
mkdir -p ~/mlab-python
cd ~/mlab-python
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install netmiko napalm paho-mqtt requests proxmoxer
```

## Validation

```bash
python - <<'PY'
import netmiko, napalm, paho.mqtt.client, requests
print('Python automation libraries OK')
PY
```

## Where scripts should go

Evaluation scripts should be placed in the relevant evaluation folder under its `Script Code/` directory, for example:

```text
docs/05_Evaluation/Network_Layer/Admin_Network_Operations_Bot/Script Code/
```

## Safety notes

- Do not hard-code credentials in scripts.
- Use environment variables or local ignored `.env` files.
- Document what each script does before using it against lab systems.
