# n8n Local Setup Inside the Ubuntu Server VM

## Purpose

n8n is the workflow orchestration layer. OpenClaw sends structured requests to n8n, and n8n performs controlled actions through Proxmox API/SSH and other integrations.

Current related VM:

| Field | Value |
| --- | --- |
| VMID | `103` |
| Proxmox name | `MlabUbuntuServ` |
| Role | Ubuntu server / automation stack |
| Current local n8n path | `http://192.168.0.152:5678` |

## Official documentation

- n8n self-hosting: <https://docs.n8n.io/hosting/>
- n8n Docker installation: <https://docs.n8n.io/hosting/installation/docker/>

## Prerequisites

Complete first:

- `docs/04_Technology_Setups/Docker_Ubuntu_Server_VM/`

## Basic Docker Compose setup

Create a project directory inside the Ubuntu Server VM:

```bash
sudo mkdir -p /opt/n8n
sudo chown -R $USER:$USER /opt/n8n
cd /opt/n8n
```

Create `docker-compose.yml`:

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - TZ=Asia/Shanghai
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

Start n8n:

```bash
docker compose up -d
docker compose logs -f n8n
```

Open:

```text
http://<ubuntu-server-ip>:5678
```

## Project workflow

The main workflow used by this project is:

```text
OpenClaw Proxmox Orchestrator
```

The current production webhook path used by the bridge is documented in:

```text
notes/openclaw-n8n-bridge.md
```

## Required n8n credentials

Create credentials in n8n for:

- Proxmox API or SSH access;
- Ubuntu Test SSH access if patching/diagnostics are used;
- n8n server SSH access if local maintenance workflows are used;
- Telegram or notification integrations if used later.

Do not commit credential values to GitHub.

## Validation

- n8n web UI opens on port `5678`.
- The workflow is active.
- A read-only webhook test returns VM status.
- State-changing workflows refuse to run unless `confirmed: true`.

## Safety notes

- Keep n8n behind LAN/VPN/tunnel protection.
- Use strong credentials.
- Back up n8n data volume before major workflow changes.
- Export workflows into the repo only after removing secrets.
