# GNS3 Network Documentation

## Project used for this workflow path

- **GNS3 project name:** `Medium_Company_Network-1-89`
- **Saved project ID from prior project notes:** `093cbefe-c972-444b-bba4-6e08a90959b4`

## Evidence basis used in this document

This summary is built from:

- preserved project notes from earlier work on the GNS3 environment;
- the local file `gns3 ubuntu sever.md`;
- the VLAN Python automation script evidence;
- workflow command references inside `Admin Network Operations Bot 1`.

A fresh live API pull was attempted during this documentation session, but the saved GNS3 API host was not reachable at that moment. Therefore, the device list below is documented from the preserved evidence rather than pretending a live sync happened.

## Confirmed or strongly evidenced devices for this workflow

| Device / node | Role in this workflow evidence | Evidence source |
| --- | --- | --- |
| `R2` | Router used for config backup through the backup child workflow | workflow route + Ubuntu TFTP notes |
| `IOU1` | Cisco switch used for VLAN operations (`show vlan brief`, access-port assignment, VLAN delete) | Python VLAN script + Ubuntu notes |
| `ubuntu_server-2` | Ubuntu Server node used as the TFTP backup target | Ubuntu notes |
| firewall / FortiGate jump device | jump path used by the VLAN Python script before reaching the switch | Python VLAN script |
| `ubuntu_server-1` | existed in the project at an earlier stage, but was intentionally skipped during one start-up session | saved 2026-03-05 notes |

## Ubuntu server setup used for router backup

The preserved Ubuntu setup notes show:

- **Ubuntu node:** `ubuntu_server-2`
- **Connected switch port:** `IOU1 Ethernet1/2`
- **Access VLAN:** `VLAN 50 (SERVERS)`
- **Gateway for VLAN 50:** `192.168.50.1`
- **Ubuntu static IP:** `192.168.50.10/24`
- **Netplan file:** `/etc/netplan/01-netcfg.yaml`
- **TFTP root directory:** `/var/lib/tftpboot`

### Netplan configuration used on Ubuntu

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens3:
      dhcp4: false
      addresses:
        - 192.168.50.10/24
      gateway4: 192.168.50.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 1.1.1.1
```

### Ubuntu commands used during setup

```bash
sudo netplan apply
ip a
ip route
ping 192.168.50.1
sudo apt update
sudo apt install tftpd-hpa -y
ss -lunp | grep :69
```

### TFTP preparation used in the lab

```bash
sudo chmod 777 /var/lib/tftpboot
sudo touch /var/lib/tftpboot/R2-running-config
sudo chmod 666 /var/lib/tftpboot/R2-running-config
sudo touch /var/lib/tftpboot/IOU1-running-config
sudo chmod 666 /var/lib/tftpboot/IOU1-running-config
```

## Router backup procedure used in the project

The backup path documented for router `R2` is:

```cisco
copy running-config tftp:
```

Prompt answers:

- remote host: `192.168.50.10`
- destination filename: `R2-running-config`

The notes also indicate the same TFTP pattern can be used for `startup-config`.

## VLAN and switch evidence used by the workflow

The VLAN automation evidence shows that the workflow interacts with a Cisco switch prompt identified as `IOU1` and uses commands such as:

- `show vlan brief`
- `show interface status`
- `configure terminal`
- `vlan <id>`
- `name <name>`
- `interface <port>`
- `switchport mode access`
- `switchport access vlan <id>`
- `no vlan <id>`
- `write memory`

### VLANs observed in preserved test output

Preserved VLAN output from earlier testing showed these VLANs on the switch:

| VLAN ID | Name | Notes |
| --- | --- | --- |
| 1 | `default` | default access VLAN |
| 10 | `HR` | active |
| 20 | `FINANCE` | active |
| 30 | `IT` | active |
| 40 | `STAFF` | active |
| 50 | `SERVERS` | active |
| 60 | `MGMT_INTERNAL` | active |
| 70 | `GUEST` | active |
| 99 | `MGMT` | active |
| 120 | `HR_USERS` | active |
| 131 | `CSIE2` | active |
| 1002-1005 | Cisco legacy defaults | hidden from the friendly Telegram display |

## Network-segmentation context used in the broader project write-up

The broader project report also documents enterprise-style VLAN segmentation concepts used in the lab design:

- **VLAN 10** - management/admin access
- **VLAN 20** - server/services segment
- **VLAN 30** - IoT segment
- **VLAN 40** - user/client segment

For this specific workflow subsection, the strongest directly evidenced VLANs are the switch VLANs listed in the table above and the Ubuntu server placement in **VLAN 50 (SERVERS)**.

## What this means for the workflow evaluation

The workflow is not just a chatbot demo. Its actions are tied to a simulated enterprise lab where:

- VLAN changes target a real switch object in GNS3;
- router backups target an Ubuntu TFTP server inside the same simulated network;
- the automation path reflects actual network management tasks rather than placeholder text-only responses.
