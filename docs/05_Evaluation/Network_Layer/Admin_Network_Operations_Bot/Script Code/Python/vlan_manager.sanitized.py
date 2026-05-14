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
        "username": "<FORTIGATE_USERNAME>",
        "password": "<FORTIGATE_PASSWORD>",
        "fast_cli": False,
    }

    fw_conn = ConnectHandler(**firewall)

    output = send_and_read(fw_conn, "execute ssh <JUMP_USER>@<JUMP_HOST>", 2)

    if "yes/no" in output.lower():
        output += send_and_read(fw_conn, "yes", 2)

    if "password" in output.lower():
        output += send_and_read(fw_conn, "<JUMP_PASSWORD>", 2)

    output += send_and_read(fw_conn, "ssh -l <SWITCH_USER> <SWITCH_MGMT_IP>", 2)

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
