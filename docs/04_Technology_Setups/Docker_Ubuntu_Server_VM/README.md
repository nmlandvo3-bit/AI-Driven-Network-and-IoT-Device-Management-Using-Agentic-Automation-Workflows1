# Docker Setup Inside the Ubuntu Server VM

## Purpose

Docker runs containerized project services inside the Ubuntu Server VM, especially n8n and supporting services.

Current related VM:

| Field | Value |
| --- | --- |
| VMID | `103` |
| Proxmox name | `MlabUbuntuServ` |
| Role | Ubuntu server / automation stack |
| CPU | 8 cores |
| RAM | 12 GB |
| Disk | 100 GB |

## Official documentation

- Docker Engine on Ubuntu: <https://docs.docker.com/engine/install/ubuntu/>
- Docker Compose: <https://docs.docker.com/compose/>

## Setup steps

Run these commands inside the Ubuntu Server VM.

### 1. Update the server

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

### 2. Install prerequisites

```bash
sudo apt install -y ca-certificates curl gnupg
```

### 3. Add Docker repository

Follow the current official Docker Ubuntu instructions. The normal flow is:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

Then add the repository for the Ubuntu release and update package lists.

### 4. Install Docker Engine

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 5. Enable Docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
```

### 6. Optional non-root Docker usage

```bash
sudo usermod -aG docker $USER
```

Log out and back in after this change.

## Validation

```bash
docker --version
docker compose version
sudo docker run hello-world
```

## Project notes

- Keep container data in documented directories such as `/opt/mlab/` or `/home/<admin>/mlab/`.
- Do not store secrets directly in compose files committed to GitHub.
- Use `.env` files locally, but keep them out of Git.
