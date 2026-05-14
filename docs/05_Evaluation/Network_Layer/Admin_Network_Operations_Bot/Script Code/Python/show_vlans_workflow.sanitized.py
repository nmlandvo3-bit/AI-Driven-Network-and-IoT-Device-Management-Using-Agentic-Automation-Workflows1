import json
import time
import re
from netmiko import ConnectHandler


def parse_vlan_brief(output: str):
    vlans = []
    current = None
    capture = False

    for raw_line in output.splitlines():
        line = raw_line.rstrip()

        # Start after the header separator line
        if re.match(r"^----\s+", line):
            capture = True
            continue

        if not capture or not line.strip():
            continue

        # New VLAN row
        # Example:
        # 10   HR                               active    Et0/1
        m = re.match(r"^\s*(\d+)\s+(\S.*?)\s{2,}(active|act/unsup|suspended)\s*(.*)$", line)
        if m:
            if current:
                vlans.append(current)

            vlan_id = m.group(1).strip()
            vlan_name = m.group(2).strip()
            status = m.group(3).strip()
            ports_raw = m.group(4).strip()

            current = {
                "vlan_id": vlan_id,
                "vlan_name": vlan_name,
                "status": status,
                "interfaces": []
            }

            if ports_raw:
                ports = [p.strip() for p in ports_raw.split(",") if p.strip()]
                current["interfaces"].extend(ports)

            continue

        # Continuation line for more ports
        # Example:
        #                                         Et2/3, Et3/0, Et3/1
        if current:
            extra_ports = [p.strip() for p in line.split(",") if p.strip()]
            current["interfaces"].extend(extra_ports)

    if current:
        vlans.append(current)

    return vlans


try:
    firewall = {
        "device_type": "fortinet",
        "host": "<FORTIGATE_MGMT_IP>",
        "username": "<DEVICE_USERNAME>",
        "password": "<DEVICE_PASSWORD>",
        "fast_cli": False,
    }

    fw_conn = ConnectHandler(**firewall)

    output = ""

    # STEP 1: SSH to R2
    fw_conn.write_channel("execute ssh <ROUTER_USER>@<ROUTER_SSH_HOST>\n")
    time.sleep(2)
    output += fw_conn.read_channel()

    if "yes/no" in output.lower():
        fw_conn.write_channel("yes\n")
        time.sleep(2)
        output += fw_conn.read_channel()

    if "password" in output.lower():
        fw_conn.write_channel("<ROUTER_JUMP_PASSWORD>\n")
        time.sleep(2)
        output += fw_conn.read_channel()

    # STEP 2: SSH from R2 -> SWITCH
    fw_conn.write_channel("ssh -l NetAdmin 192.168.99.2\n")
    time.sleep(2)
    output += fw_conn.read_channel()

    if "yes/no" in output.lower():
        fw_conn.write_channel("yes\n")
        time.sleep(2)
        output += fw_conn.read_channel()

    if "password" in output.lower():
        fw_conn.write_channel("<SWITCH_PASSWORD>\n")
        time.sleep(2)
        output += fw_conn.read_channel()

    # STEP 3: RUN VLAN COMMAND ON SWITCH
    fw_conn.write_channel("show vlan brief\n")
    time.sleep(3)
    vlan_output = fw_conn.read_channel()
    output += vlan_output

    parsed_vlans = parse_vlan_brief(vlan_output)

    # EXIT SWITCH -> R2 -> FIREWALL
    fw_conn.write_channel("exit\n")
    time.sleep(1)
    fw_conn.write_channel("exit\n")
    time.sleep(1)

    fw_conn.disconnect()

    result = {
        "status": "success",
        "vlan_count": len(parsed_vlans),
        "vlans": parsed_vlans,
        "raw_vlan_output": vlan_output
    }

except Exception as e:
    result = {
        "status": "error",
        "message": str(e)
    }

print(json.dumps(result))