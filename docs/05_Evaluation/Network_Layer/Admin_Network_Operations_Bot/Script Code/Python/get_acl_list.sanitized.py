import json
import time
import re
from netmiko import ConnectHandler

VLAN_MAP = {
    "192.168.10.0": "HR",
    "192.168.20.0": "FINANCE",
    "192.168.30.0": "IT",
    "192.168.40.0": "STAFF",
    "192.168.50.0": "SERVERS",
    "192.168.60.0": "MGMT_INTERNAL",
    "192.168.70.0": "GUEST",
    "192.168.99.0": "MGMT",
}

def add_vlan_names_to_acl(output):
    enriched_lines = []

    for line in output.splitlines():
        new_line = line
        matches = re.findall(r"(192\.168\.\d+\.0)", line)

        for subnet in matches:
            vlan_name = VLAN_MAP.get(subnet)
            if vlan_name:
                new_line = new_line.replace(subnet, f"{subnet} ({vlan_name})")

        enriched_lines.append(new_line)

    return "\n".join(enriched_lines)

result = {
    "status": "success",
    "device": "R2",
    "command": "show access-lists",
    "output": ""
}

try:
    firewall = {
        "device_type": "fortinet",
        "host": "<FORTIGATE_MGMT_IP>",
        "username": "<DEVICE_USERNAME>",
        "password": "<DEVICE_PASSWORD>",
        "fast_cli": False,
    }

    fw = ConnectHandler(**firewall)

    output = ""

    fw.write_channel("execute ssh <ROUTER_USER>@<ROUTER_SSH_HOST>\n")
    time.sleep(2)
    output += fw.read_channel()

    if "yes/no" in output.lower():
        fw.write_channel("yes\n")
        time.sleep(2)
        output += fw.read_channel()

    if "password" in output.lower():
        fw.write_channel("<ROUTER_JUMP_PASSWORD>\n")
        time.sleep(2)
        output += fw.read_channel()

    fw.write_channel("terminal length 0\n")
    time.sleep(1)
    fw.read_channel()

    fw.write_channel("show access-lists\n")
    time.sleep(3)
    acl_output = fw.read_channel()

    fw.write_channel("exit\n")
    time.sleep(1)
    fw.disconnect()

    result["output"] = add_vlan_names_to_acl(acl_output)

except Exception as e:
    result["status"] = "error"
    result["message"] = str(e)

print(json.dumps(result))