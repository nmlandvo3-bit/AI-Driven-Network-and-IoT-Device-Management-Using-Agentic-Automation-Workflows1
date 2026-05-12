# Ollama Setup at the Proxmox Level

## Purpose

Ollama provides local AI model serving for the lab. In this design, Ollama runs at the Proxmox/host level or a host-level service location and is exposed on the lab network so VMs can access it.

This allows VMs such as n8n, Ubuntu Desktop, or test systems to call a shared local LLM endpoint instead of each VM running its own model server.

## Official documentation

- Ollama Linux install: <https://docs.ollama.com/linux>
- Ollama FAQ and environment variables: <https://docs.ollama.com/faq>

## Important design note

Installing extra software directly on a Proxmox host can increase risk. For production systems, it is often cleaner to run Ollama in a dedicated VM or container. For this project documentation, this folder follows the requested design: Ollama at the Proxmox level and reachable by lab VMs.

## Setup steps

Run on the Proxmox host or the chosen host-level Linux environment.

### 1. Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Enable Ollama service

```bash
systemctl enable ollama
systemctl start ollama
systemctl status ollama
```

### 3. Pull a model

Choose a model that fits available CPU/RAM/GPU resources.

```bash
ollama pull mistral
# or
ollama pull llama3.1
```

### 4. Expose Ollama to VMs

By default, Ollama commonly listens only on localhost. Configure it to listen on the lab interface.

Create or edit the systemd override:

```bash
systemctl edit ollama
```

Add:

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

Reload and restart:

```bash
systemctl daemon-reload
systemctl restart ollama
```

### 5. Firewall/network access

Allow only trusted lab networks to access port `11434`.

Example concept:

```text
VMs on lab LAN -> Proxmox/Ollama IP:11434
```

Do not expose Ollama directly to the public internet.

## VM access test

From a VM:

```bash
curl http://<proxmox-or-ollama-ip>:11434/api/tags
```

Expected result: JSON listing available Ollama models.

## n8n/OpenClaw usage

n8n or OpenClaw can call Ollama using HTTP endpoints. Store the base URL as configuration, not hard-coded secrets:

```text
http://<ollama-host-ip>:11434
```

## Validation

- `ollama list` works on the host.
- `curl http://127.0.0.1:11434/api/tags` works on the host.
- `curl http://<host-ip>:11434/api/tags` works from a VM.
- n8n can reach the same endpoint.

## Safety notes

- Restrict access to trusted lab networks only.
- Monitor CPU/RAM usage because model inference can consume significant resources.
- If Proxmox stability is affected, move Ollama into a dedicated VM.
