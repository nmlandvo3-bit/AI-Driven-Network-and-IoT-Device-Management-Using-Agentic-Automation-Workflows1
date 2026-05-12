# MQTT / IoT Simulation Setup

## Purpose

MQTT supports the IoT side of the project by simulating telemetry from devices and allowing workflows to observe or react to IoT events.

Current related VM:

| Field | Value |
| --- | --- |
| VMID | `100` |
| Proxmox name | `IOT-CORE` |
| Role | IoT simulation / core service VM |

## Typical components

- MQTT broker, for example Mosquitto;
- simulated IoT publishers;
- subscriber scripts for testing;
- n8n MQTT trigger or polling workflow;
- optional dashboard/log collector.

## Example setup outline

Inside the IoT Core VM:

```bash
sudo apt update
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

Test locally:

```bash
mosquitto_sub -h localhost -t mlab/test
mosquitto_pub -h localhost -t mlab/test -m "hello"
```

## Project integration

- n8n can subscribe to MQTT topics.
- Python scripts can publish simulated telemetry using Paho-MQTT.
- OpenClaw can summarize alerts or trigger safe workflows.

## Safety notes

- Do not expose MQTT publicly without authentication and TLS.
- Use clear topic naming such as `mlab/iot/<device>/telemetry`.
- Keep test data separate from real devices.
