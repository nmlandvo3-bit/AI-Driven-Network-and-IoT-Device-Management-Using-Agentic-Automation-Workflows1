# Level 4 — Technology Setups

This level documents the major technologies used to build the MLAB project after the Proxmox host and VMs exist.

## Folders

| Folder | Purpose |
| --- | --- |
| `GNS3_VM/` | Set up the GNS3 VM backend used for network simulation. |
| `Docker_Ubuntu_Server_VM/` | Install Docker inside the Ubuntu Server VM. |
| `n8n_Local_Ubuntu_Server_VM/` | Run local/self-hosted n8n inside the Ubuntu Server VM using Docker. |
| `Ollama_Proxmox_Level/` | Run Ollama at the Proxmox/host level and expose it to lab VMs. |
| `MQTT_IoT_Simulation/` | Prepare MQTT/IoT simulation services for the IoT layer. |
| `Python_Automation_Libraries/` | Prepare Python automation libraries such as Netmiko, NAPALM, and Paho-MQTT. |

Read these after:

1. `docs/01_Project_Minimum_Requirements/`
2. `docs/02_Proxmox_Setup/`
3. `docs/03_VMs_Setup/`
