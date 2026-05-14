# GNS3 Network Documentation

## Project used for this workflow path

- **GNS3 project name:** `Medium_Company_Network-1-89`

## Evidence basis used in this document

This summary is built from:

- preserved project notes from earlier work on the GNS3 environment;
- the local file `gns3 ubuntu sever.md`;
- the VLAN Python automation script evidence;
- workflow command references inside `Admin Network Operations Bot`;
- a fresh live GNS3 API pull from the active server during this documentation update.

## Project files included in this folder

A `Project Files/` subfolder is now included so this section stores the actual project file evidence used for the lab:

- `Project Files/Medium_Company_Network-1-89.gns3` - project metadata file from the live GNS3 API
- `Project Files/Medium_Company_Network-1-89.nodes.json` - node inventory export
- `Project Files/Medium_Company_Network-1-89.links.json` - link inventory export
- `Project Files/Medium_Company_Network-1-89.full-export.json` - combined project, node, and link export

These files were collected from the live project `Medium_Company_Network-1-89` on the reachable GNS3 server and included here as implementation evidence.

## Confirmed devices from the live project export

The live project export showed **16 nodes** and **15 links**.

| Device / node | Type | Role in this workflow evidence |
| --- | --- | --- |
| `R2` | `dynamips` | Router used for config backup through the backup child workflow |
| `IOU1` | `iou` | Cisco switch used for VLAN operations (`show vlan brief`, access-port assignment, VLAN delete) |
| `ubuntu_server-2` | `qemu` | Ubuntu Server node used as the TFTP backup target |
| `FortiGate7.0.9-2` | `qemu` | firewall/jump device used in the VLAN automation path |
| `VLAN10—HR` | `ethernet_switch` | access segment for HR |
| `VLAN20—FINANCE` | `ethernet_switch` | access segment for Finance |
| `VLAN30—IT` | `ethernet_switch` | access segment for IT |
| `VLAN40—STAFF` | `ethernet_switch` | access segment for Staff |
| `DMZ_GUEST_VLAN70` | `ethernet_switch` | guest/DMZ access segment |
| `HR-PC` | `vpcs` | end-user test host |
| `FINACE-PC` | `vpcs` | end-user test host |
| `IT-PC` | `vpcs` | end-user test host |
| `STAFF-PC` | `vpcs` | end-user test host |
| `GUEST-PC1` | `vpcs` | guest network test host |
| `DMZ-PC` | `vpcs` | DMZ network test host |
| `Cloud1` | `cloud` | external/cloud connectivity node |

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

- the automation path reflects actual network management tasks rather than placeholder text-only responses.
