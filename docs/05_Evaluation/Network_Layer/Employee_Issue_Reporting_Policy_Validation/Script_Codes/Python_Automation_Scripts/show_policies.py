import json
import re
import time
from netmiko import ConnectHandler

firewall = {
    "device_type": "fortinet",
    "host": "<FORTIGATE_MGMT_IP>",
    "username": "<DEVICE_USERNAME>",
    "password": "<DEVICE_PASSWORD>",
    "fast_cli": False,
}

result = {
    "status": "success",
    "blocked_sites": [],
    "message": ""
}

try:
    fw = ConnectHandler(**firewall)

    commands = [
        'show firewall addrgrp "BLOCK_SOCIAL_MEDIA"',
        "show firewall address",
    ]

    output = ""

    for cmd in commands:
        fw.write_channel(cmd + "\n")
        time.sleep(2)
        output += fw.read_channel()

    fw.disconnect()

    members_match = re.search(r'set member (.+)', output)
    members = []

    if members_match:
        members = re.findall(r'"([^"]+)"', members_match.group(1))

    sites = []

    for member in members:
        pattern = rf'edit "{re.escape(member)}"(.*?)next'
        match = re.search(pattern, output, re.DOTALL)

        fqdn = None
        if match:
            fqdn_match = re.search(r'set fqdn "([^"]+)"', match.group(1))
            if fqdn_match:
                fqdn = fqdn_match.group(1)

        sites.append({
            "object_name": member,
            "site": fqdn or member,
            "status": "BLOCKED"
        })

    result["blocked_sites"] = sites

    if sites:
        msg = "🚫 Blocked Social Media Sites\n\n"
        for site in sites:
            msg += f"🌐 {site['site']}\n"
        result["message"] = msg
    else:
        result["message"] = "No blocked social media sites found."

except Exception as e:
    result["status"] = "error"
    result["message"] = str(e)

print(json.dumps(result))