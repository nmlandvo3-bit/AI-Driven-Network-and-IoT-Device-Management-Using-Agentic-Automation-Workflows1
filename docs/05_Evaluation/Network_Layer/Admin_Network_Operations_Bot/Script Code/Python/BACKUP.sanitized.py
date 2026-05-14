import sys
import json
from netmiko import ConnectHandler

action = sys.argv[1]
vlan_id = sys.argv[2]
vlan_name = sys.argv[3] if len(sys.argv) > 3 else ""

result = {
    "status": "success",
    "action": action,
    "vlan_id": vlan_id,
    "message": ""
}

router_success = False

try:
    # 🔹 Connect to Firewall first
    firewall = {
        "device_type": "fortinet",
        "host": "<FORTIGATE_MGMT_IP>",
        "username": "<DEVICE_USERNAME>",
        "password": "<DEVICE_PASSWORD>"
    }

    fw_conn = ConnectHandler(**firewall)

    # 🔹 SSH into Router from Firewall
    fw_conn.write_channel("ssh <ROUTER_USER>@<ROUTER_SSH_HOST>\n")
    fw_conn.read_until_pattern("password")
    fw_conn.write_channel("<ROUTER_JUMP_PASSWORD>\n")
    fw_conn.read_until_pattern("#")

    # 🔹 Get VLAN list
    fw_conn.write_channel("show vlan brief\n")
    vlan_output = fw_conn.read_until_pattern("#")

    vlan_exists = f"{vlan_id}" in vlan_output

    # 🔥 DECISION LOGIC
    if action == "create":
        if vlan_exists:
            raise Exception(f"VLAN {vlan_id} already exists")

        fw_conn.write_channel(f"configure terminal\n")
        fw_conn.read_until_pattern("#")

        fw_conn.write_channel(f"vlan {vlan_id}\n")
        fw_conn.write_channel(f"name {vlan_name}\n")
        fw_conn.write_channel("end\n")

        router_success = True
        result["message"] = f"VLAN {vlan_id} ({vlan_name}) created"

    elif action == "delete":
        if not vlan_exists:
            raise Exception(f"VLAN {vlan_id} does not exist")

        fw_conn.write_channel("configure terminal\n")
        fw_conn.read_until_pattern("#")

        fw_conn.write_channel(f"no vlan {vlan_id}\n")
        fw_conn.write_channel("end\n")

        router_success = True
        result["message"] = f"VLAN {vlan_id} deleted"

    # 🔹 Exit router session
    fw_conn.write_channel("exit\n")

    # 🔹 Configure Firewall interface
    if action == "create":
        fw_cmds = [
            "config system interface",
            f"edit vlan{vlan_id}",
            f"set vlanid {vlan_id}",
            "set interface port2",
            f"set alias {vlan_name}",
            "next",
            "end"
        ]
    else:
        fw_cmds = [
            "config system interface",
            f"delete vlan{vlan_id}",
            "end"
        ]

    fw_conn.send_config_set(fw_cmds)
    fw_conn.disconnect()

except Exception as e:

    # 🔥 ROLLBACK (router only)
    if router_success:
        try:
            fw_conn = ConnectHandler(**firewall)

            fw_conn.write_channel("ssh <ROUTER_USER>@<ROUTER_SSH_HOST>\n")
            fw_conn.read_until_pattern("password")
            fw_conn.write_channel("<ROUTER_JUMP_PASSWORD>\n")
            fw_conn.read_until_pattern("#")

            fw_conn.write_channel("configure terminal\n")

            if action == "create":
                fw_conn.write_channel(f"no vlan {vlan_id}\n")
            elif action == "delete":
                fw_conn.write_channel(f"vlan {vlan_id}\n")
                fw_conn.write_channel("name ROLLBACK\n")

            fw_conn.write_channel("end\n")
            fw_conn.write_channel("exit\n")
            fw_conn.disconnect()

        except:
            pass

    result["status"] = "error"
    result["message"] = f"Operation failed: {str(e)}"

# ✅ FINAL OUTPUT (ONLY ONCE)
print(json.dumps(result))

################ Second code
import sys
import json
from netmiko import ConnectHandler
from netmiko import ConnectHandler, NetMikoAuthenticationException, NetMikoTimeoutException

def fail(action, vlan_id, message):
    print(json.dumps({
        "status": "error",
        "action": action,
        "vlan_id": vlan_id,
        "message": message
    }))
    sys.exit(1)

def success(action, vlan_id, message):
    print(json.dumps({
        "status": "success",
        "action": action,
        "vlan_id": vlan_id,
        "message": message
    }))
    sys.exit(0)

# Arguments
if len(sys.argv) < 3:
    fail("", "", "Missing required arguments: action and vlan_id")

action = sys.argv[1].strip().lower()
vlan_id = sys.argv[2].strip()
vlan_name = sys.argv[3].strip() if len(sys.argv) > 3 and sys.argv[3].strip() else f"VLAN_{vlan_id}"

if action not in ["create", "delete"]:
    fail(action, vlan_id, "Action must be 'create' or 'delete'")

# Device definitions
fortigate = {
    "device_type": "fortinet",
    "host": "<FORTIGATE_MGMT_IP>",
    "username": "<DEVICE_USERNAME>",
    "password": "<DEVICE_PASSWORD>",
}

router = {
    "device_type": "cisco_ios",
    "host": "<ROUTER_SSH_HOST>",
    "username": "<DEVICE_USERNAME>",
    "password": "<ROUTER_JUMP_PASSWORD>",
    "secret": "<ROUTER_JUMP_PASSWORD>",
    "fast_cli": False,
}

switch = {
    "device_type": "cisco_ios",
    "host": "192.168.99.2",
    "username": "NetAdmin",
    "password": "<SWITCH_PASSWORD>",
    "secret": "<SWITCH_PASSWORD>",
    "fast_cli": False,
}

try:
    # Step 1: Connect to FortiGate
    fg_conn = ConnectHandler(**fortigate)

    # Step 2: SSH from FortiGate to Router
    fg_conn.write_channel("ssh <ROUTER_USER>@<ROUTER_SSH_HOST>\n")
    fg_conn.read_until_pattern("password")
    fg_conn.write_channel("<ROUTER_JUMP_PASSWORD>\n")
    fg_conn.read_until_pattern("#")

    # Step 3: SSH from Router to Switch
    fg_conn.write_channel("ssh NetAdmin@192.168.99.2\n")
    fg_conn.read_until_pattern("password")
    fg_conn.write_channel("<SWITCH_PASSWORD>\n")
    fg_conn.read_until_pattern("#")

    # Now at the switch, check VLAN
    fg_conn.write_channel("show vlan brief\n")
    vlan_output = fg_conn.read_until_pattern("#")
    vlan_exists = f"{vlan_id}" in vlan_output

    if action == "create":
        if vlan_exists:
            fail(action, vlan_id, f"VLAN {vlan_id} already exists on switch")
        fg_conn.write_channel(f"configure terminal\nvlan {vlan_id}\nname {vlan_name}\nend\n")
    elif action == "delete":
        if not vlan_exists:
            fail(action, vlan_id, f"VLAN {vlan_id} does not exist on switch")
        fg_conn.write_channel(f"configure terminal\nno vlan {vlan_id}\nend\n")

    # Disconnect switch/router session
    fg_conn.write_channel("exit\n")  # back to router
    fg_conn.write_channel("exit\n")  # back to FortiGate

    # Step 4: Update FortiGate interface
    if action == "create":
        fg_conn.send_config_set([
            "config system interface",
            f"edit vlan{vlan_id}",
            f"set vlanid {vlan_id}",
            "set interface port2",
            f"set alias {vlan_name}",
            "next",
            "end"
        ])
    elif action == "delete":
        fg_conn.send_config_set([
            "config system interface",
            f"delete vlan{vlan_id}",
            "end"
        ])

    fg_conn.disconnect()
    success(action, vlan_id, f"VLAN {vlan_id} {action}d on switch and FortiGate")

except NetMikoAuthenticationException:
    fail(action, vlan_id, "Authentication failed on one of the devices")

except NetMikoTimeoutException:
    fail(action, vlan_id, "Connection timed out to one of the devices")

except Exception as e:
    fail(action, vlan_id, f"Operation failed: {str(e)}")

    ######Web hook Token
#    5c5c6fdba8a41399

# create and delete command on terminal
# python vlan_manager.py create 120 HR_USERS
# python vlan_manager.py delete 120 ""

#show vlans.py
import json
from netmiko import ConnectHandler
import time

try:
    firewall = {
        "device_type": "fortinet",
        "host": "<FORTIGATE_MGMT_IP>",
        "username": "<DEVICE_USERNAME>",
        "password": "<DEVICE_PASSWORD>"
    }

    fw_conn = ConnectHandler(**firewall)

    output = ""

    # 🔹 STEP 1: SSH to R2
    fw_conn.write_channel("execute ssh <ROUTER_USER>@<ROUTER_SSH_HOST>\n")
    time.sleep(2)
    output += fw_conn.read_channel()

    if "yes/no" in output:
        fw_conn.write_channel("yes\n")
        time.sleep(2)
        output += fw_conn.read_channel()

    if "Password" in output or "password" in output:
        fw_conn.write_channel("<ROUTER_JUMP_PASSWORD>\n")
        time.sleep(2)
        output += fw_conn.read_channel()

    # 🔹 STEP 2: SSH from R2 → SWITCH (NetAdmin@192.168.99.2)
    fw_conn.write_channel("ssh -l NetAdmin 192.168.0.23\n")
    time.sleep(2)
    output += fw_conn.read_channel()

    if "yes/no" in output:
        fw_conn.write_channel("yes\n")
        time.sleep(2)
        output += fw_conn.read_channel()

    if "Password" in output or "password" in output:
        fw_conn.write_channel("<SWITCH_PASSWORD>\n")
        time.sleep(2)
        output += fw_conn.read_channel()

    # 🔹 STEP 3: RUN VLAN COMMAND ON SWITCH
    fw_conn.write_channel("show vlan brief\n")
    time.sleep(3)
    vlan_output = fw_conn.read_channel()
    output += vlan_output

    # 🔹 EXIT SWITCH → R2 → FIREWALL
    fw_conn.write_channel("exit\n")  # exit switch
    time.sleep(1)
    fw_conn.write_channel("exit\n")  # exit router
    time.sleep(1)

    fw_conn.disconnect()

    result = {
        "status": "success",
        "vlans": vlan_output
    }

except Exception as e:
    result = {
        "status": "error",
        "message": str(e)
    }

print(json.dumps(result))


# working vlan_manager.py
import sys
import json
import time
from netmiko import ConnectHandler

def fail(action, vlan_id, message):
    print(json.dumps({
        "status": "error",
        "action": action,
        "vlan_id": vlan_id,
        "message": message
    }))
    sys.exit(1)

def success(action, vlan_id, message):
    print(json.dumps({
        "status": "success",
        "action": action,
        "vlan_id": vlan_id,
        "message": message
    }))
    sys.exit(0)

if len(sys.argv) < 3:
    fail("", "", "Missing required arguments: action and vlan_id")

action = sys.argv[1].strip().lower()
vlan_id = sys.argv[2].strip()
vlan_name = sys.argv[3].strip() if len(sys.argv) > 3 and sys.argv[3].strip() else f"VLAN_{vlan_id}"

if action not in ["create", "delete"]:
    fail(action, vlan_id, "Action must be 'create' or 'delete'")

try:
    firewall = {
        "device_type": "fortinet",
        "host": "<FORTIGATE_MGMT_IP>",
        "username": "<DEVICE_USERNAME>",
        "password": "<DEVICE_PASSWORD>",
    }

    fw_conn = ConnectHandler(**firewall)
    output = ""

    # Step 1: FortiGate -> R2
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

    # Step 2: R2 -> Switch
    fw_conn.write_channel("ssh -l NetAdmin 192.168.0.23\n")
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

    # Step 3: Check current VLANs
    fw_conn.write_channel("show vlan brief\n")
    time.sleep(3)
    vlan_output = fw_conn.read_channel()
    output += vlan_output

    vlan_exists = any(line.strip().startswith(vlan_id) for line in vlan_output.splitlines())

    # Step 4: Create or delete on switch
    if action == "create":
        if vlan_exists:
            fw_conn.write_channel("exit\n")
            time.sleep(1)
            fw_conn.write_channel("exit\n")
            time.sleep(1)
            fw_conn.disconnect()
            fail(action, vlan_id, f"VLAN {vlan_id} already exists on switch")

        fw_conn.write_channel("configure terminal\n")
        time.sleep(1)
        fw_conn.read_channel()

        fw_conn.write_channel(f"vlan {vlan_id}\n")
        time.sleep(1)
        fw_conn.read_channel()

        fw_conn.write_channel(f"name {vlan_name}\n")
        time.sleep(1)
        fw_conn.read_channel()

        fw_conn.write_channel("end\n")
        time.sleep(1)
        fw_conn.read_channel()

        fw_conn.write_channel("write memory\n")
        time.sleep(2)
        fw_conn.read_channel()

    elif action == "delete":
        if not vlan_exists:
            fw_conn.write_channel("exit\n")
            time.sleep(1)
            fw_conn.write_channel("exit\n")
            time.sleep(1)
            fw_conn.disconnect()
            fail(action, vlan_id, f"VLAN {vlan_id} does not exist on switch")

        fw_conn.write_channel("configure terminal\n")
        time.sleep(1)
        fw_conn.read_channel()

        fw_conn.write_channel(f"no vlan {vlan_id}\n")
        time.sleep(1)
        fw_conn.read_channel()

        fw_conn.write_channel("end\n")
        time.sleep(1)
        fw_conn.read_channel()

        fw_conn.write_channel("write memory\n")
        time.sleep(2)
        fw_conn.read_channel()

    # Step 5: Exit switch and router
    fw_conn.write_channel("exit\n")
    time.sleep(1)
    fw_conn.read_channel()

    fw_conn.write_channel("exit\n")
    time.sleep(1)
    fw_conn.read_channel()

    # Step 6: Update FortiGate
    if action == "create":
        fw_cmds = [
            "config system interface",
            f"edit vlan{vlan_id}",
            f"set vlanid {vlan_id}",
            "set interface port2",
            f"set alias {vlan_name}",
            "next",
            "end"
        ]
    else:
        fw_cmds = [
            "config system interface",
            f"delete vlan{vlan_id}",
            "end"
        ]

    fw_conn.send_config_set(fw_cmds)
    fw_conn.disconnect()

    if action == "create":
        success(action, vlan_id, f"VLAN {vlan_id} ({vlan_name}) created on switch and FortiGate")
    else:
        success(action, vlan_id, f"VLAN {vlan_id} deleted from switch and FortiGate")

except Exception as e:
    fail(action, vlan_id, f"Operation failed: {str(e)}")

    # Vlan_manager Latest script
    import sys
import json
import time
import re
from netmiko import ConnectHandler


def fail(action, vlan_id, message):
    print(json.dumps({
        "status": "error",
        "action": action,
        "vlan_id": vlan_id,
        "message": message
    }))
    sys.exit(1)


def success(action, vlan_id, message, assigned_port=None, reassigned_ports=None):
    result = {
        "status": "success",
        "action": action,
        "vlan_id": vlan_id,
        "message": message
    }
    if assigned_port:
        result["assigned_port"] = assigned_port
    if reassigned_ports:
        result["reassigned_ports"] = reassigned_ports
    print(json.dumps(result))
    sys.exit(0)


def debug(msg):
    print(f"[DEBUG] {msg}", file=sys.stderr)


def wait_read(conn, delay=2):
    time.sleep(delay)
    return conn.read_channel()


def send_and_read(conn, cmd, delay=2):
    conn.write_channel(cmd + "\n")
    return wait_read(conn, delay)


def vlan_exists_in_output(vlan_output, vlan_id):
    pattern = re.compile(rf"^{re.escape(str(vlan_id))}\s+", re.MULTILINE)
    return bool(pattern.search(vlan_output))


def parse_interface_status(interface_output):
    parsed = []

    for raw_line in interface_output.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        lower = line.lower()

        if lower.startswith("port "):
            continue
        if lower.startswith("show interface status"):
            continue
        if line.startswith(("IOU1#", "IOU1>", "#", ">")):
            continue

        parts = line.split()
        if len(parts) < 3:
            continue

        port = parts[0]
        status = parts[1]
        vlan = parts[2]

        if not re.match(r"^(Et|Fa|Gi|Te|Po)\S+", port):
            continue

        parsed.append({
            "port": port,
            "status": status.lower(),
            "vlan": vlan.lower(),
            "raw": line,
        })

    return parsed


def find_candidate_ports(interface_output):
    interfaces = parse_interface_status(interface_output)

    disconnected = []
    vlan1_connected = []

    for item in interfaces:
        port = item["port"]
        status = item["status"]
        vlan = item["vlan"]

        if vlan == "trunk":
            continue

        if status == "notconnect":
            disconnected.append(port)
        elif status == "connected" and vlan == "1":
            vlan1_connected.append(port)

    return disconnected, vlan1_connected


def get_ports_for_vlan(vlan_output, vlan_id):
    """
    Parse `show vlan brief` output and return ports assigned to vlan_id.
    Handles wrapped port lines under the Ports column.
    """
    lines = vlan_output.splitlines()
    ports = []
    capture = False

    vlan_pattern = re.compile(rf"^{re.escape(str(vlan_id))}\s+")
    new_vlan_pattern = re.compile(r"^\d+\s+")

    for raw_line in lines:
        line = raw_line.rstrip()
        stripped = line.strip()

        if not stripped:
            continue

        if stripped.startswith("VLAN ") or stripped.startswith("----") or stripped.startswith("show vlan brief"):
            continue

        if vlan_pattern.match(stripped):
            capture = True
            parts = re.split(r"\s{2,}", stripped, maxsplit=3)
            if len(parts) >= 4 and parts[3].strip():
                ports.extend([p.strip().rstrip(",") for p in parts[3].split(",") if p.strip()])
            continue

        if capture:
            if new_vlan_pattern.match(stripped):
                break

            continuation_ports = [p.strip().rstrip(",") for p in stripped.split(",") if p.strip()]
            if continuation_ports:
                ports.extend(continuation_ports)

    clean_ports = []
    for p in ports:
        if re.match(r"^(Et|Fa|Gi|Te|Po)\S+$", p):
            clean_ports.append(p)

    return clean_ports


if len(sys.argv) < 3:
    fail("", "", "Missing required arguments: action and vlan_id")

action = sys.argv[1].strip().lower()
vlan_id = sys.argv[2].strip()
vlan_name = sys.argv[3].strip() if len(sys.argv) > 3 and sys.argv[3].strip() else f"VLAN_{vlan_id}"

if action not in ["create", "delete"]:
    fail(action, vlan_id, "Action must be 'create' or 'delete'")

if not vlan_id.isdigit():
    fail(action, vlan_id, "VLAN ID must be numeric")

reserved_vlans = {"1", "1002", "1003", "1004", "1005"}

if action == "delete" and vlan_id in reserved_vlans:
    fail(action, vlan_id, f"Deletion of protected VLAN {vlan_id} is not allowed")

try:
    firewall = {
        "device_type": "fortinet",
        "host": "<FORTIGATE_MGMT_IP>",
        "username": "<DEVICE_USERNAME>",
        "password": "<DEVICE_PASSWORD>",
        "fast_cli": False,
    }

    fw_conn = ConnectHandler(**firewall)

    output = send_and_read(fw_conn, "execute ssh <ROUTER_USER>@<ROUTER_SSH_HOST>", 2)

    if "yes/no" in output.lower():
        output += send_and_read(fw_conn, "yes", 2)

    if "password" in output.lower():
        output += send_and_read(fw_conn, "<ROUTER_JUMP_PASSWORD>", 2)

    output += send_and_read(fw_conn, "ssh -l NetAdmin 192.168.0.23", 2)

    if "yes/no" in output.lower():
        output += send_and_read(fw_conn, "yes", 2)

    if "password" in output.lower():
        output += send_and_read(fw_conn, "<SWITCH_PASSWORD>", 2)

    debug("Connected through jump path, checking switch output context")

    vlan_output = send_and_read(fw_conn, "show vlan brief", 3)
    debug(f"show vlan brief output:\n{vlan_output}")

    vlan_exists = vlan_exists_in_output(vlan_output, vlan_id)

    assigned_port = None
    reassigned_ports = []
    assignment_note = ""

    if action == "create":
        if vlan_exists:
            send_and_read(fw_conn, "exit", 1)
            send_and_read(fw_conn, "exit", 1)
            fw_conn.disconnect()
            fail(action, vlan_id, f"VLAN {vlan_id} already exists on switch")

        interface_output = send_and_read(fw_conn, "show interface status", 3)
        debug(f"show interface status output:\n{interface_output}")

        disconnected_ports, vlan1_ports = find_candidate_ports(interface_output)

        if disconnected_ports:
            assigned_port = disconnected_ports[0]
            assignment_note = "assigned to unused disconnected port"
        elif vlan1_ports:
            assigned_port = vlan1_ports[0]
            assignment_note = "assigned to connected VLAN 1 port"
        else:
            send_and_read(fw_conn, "exit", 1)
            send_and_read(fw_conn, "exit", 1)
            fw_conn.disconnect()
            fail(action, vlan_id, "No eligible ports found to assign VLAN")

        send_and_read(fw_conn, "configure terminal", 1)
        send_and_read(fw_conn, f"vlan {vlan_id}", 1)
        send_and_read(fw_conn, f"name {vlan_name}", 1)
        send_and_read(fw_conn, f"interface {assigned_port}", 1)
        send_and_read(fw_conn, "switchport mode access", 1)
        send_and_read(fw_conn, f"switchport access vlan {vlan_id}", 1)
        send_and_read(fw_conn, "end", 1)
        send_and_read(fw_conn, "write memory", 2)

    elif action == "delete":
        if not vlan_exists:
            send_and_read(fw_conn, "exit", 1)
            send_and_read(fw_conn, "exit", 1)
            fw_conn.disconnect()
            fail(action, vlan_id, f"VLAN {vlan_id} does not exist on switch")

        vlan_ports = get_ports_for_vlan(vlan_output, vlan_id)
        debug(f"Ports currently assigned to VLAN {vlan_id}: {vlan_ports}")

        send_and_read(fw_conn, "configure terminal", 1)

        for port in vlan_ports:
            send_and_read(fw_conn, f"interface {port}", 1)
            send_and_read(fw_conn, "switchport mode access", 1)
            send_and_read(fw_conn, "switchport access vlan 1", 1)
            reassigned_ports.append(port)

        send_and_read(fw_conn, f"no vlan {vlan_id}", 1)
        send_and_read(fw_conn, "end", 1)
        send_and_read(fw_conn, "write memory", 2)

    send_and_read(fw_conn, "exit", 1)
    send_and_read(fw_conn, "exit", 1)

    if action == "create":
        fw_cmds = [
            "config system interface",
            f"edit vlan{vlan_id}",
            f"set vlanid {vlan_id}",
            "set interface port2",
            f"set alias {vlan_name}",
            "next",
            "end"
        ]
    else:
        fw_cmds = [
            "config system interface",
            f"delete vlan{vlan_id}",
            "end"
        ]

    fw_conn.send_config_set(fw_cmds)
    fw_conn.disconnect()

    if action == "create":
        success(
            action,
            vlan_id,
            f"VLAN {vlan_id} ({vlan_name}) created and assigned to port {assigned_port} on switch ({assignment_note})",
            assigned_port=assigned_port
        )
    else:
        if reassigned_ports:
            success(
                action,
                vlan_id,
                f"VLAN {vlan_id} deleted from switch, ports moved back to VLAN 1",
                reassigned_ports=reassigned_ports
            )
        else:
            success(
                action,
                vlan_id,
                f"VLAN {vlan_id} deleted from switch"
            )

except Exception as e:
    fail(action, vlan_id, f"Operation failed: {str(e)}")

    cd /home/mlandvo/.openclaw/workspace
git config --global user.name "hualiguide"
git config --global user.email "hualiguideaiproject@gmail.com"
git add README.md RECOVERY.md .gitignore
git add -f .env.example
git commit -m "Add recovery repo scaffold"
git branch -M main
git push -u origin main
861D-338A
