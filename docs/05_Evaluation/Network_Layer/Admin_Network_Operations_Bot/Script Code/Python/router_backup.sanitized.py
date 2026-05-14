import sys
import json
import time
from netmiko import ConnectHandler


TFTP_SERVER_IP = "192.168.50.10"
TFTP_BASE_PATH = "/var/lib/tftpboot"

ROUTERS = {
    "R2": {
        "ssh_user": "<DEVICE_USERNAME>",
        "ssh_host": "<ROUTER_SSH_HOST>",
        "ssh_password": "<ROUTER_JUMP_PASSWORD>",
        "running_file": "R2-running-config",
        "startup_file": "R2-startup-config",
    }
}


def emit(payload, code=0):
    print(json.dumps(payload))
    sys.exit(code)


def fail(message, **extra):
    emit({"status": "error", "message": message, **extra}, 1)


def success(message, **extra):
    emit({"status": "success", "message": message, **extra}, 0)


def debug(msg):
    print(f"[DEBUG] {msg}", file=sys.stderr)


def wait_read(conn, delay=2):
    time.sleep(delay)
    return conn.read_channel()


def send_and_read(conn, cmd, delay=2):
    conn.write_channel(cmd + "\n")
    return wait_read(conn, delay)


def handle_interactive_copy(conn, source_command, server_ip, destination_file):
    output = send_and_read(conn, source_command, 2)

    if "address or name of remote host" in output.lower():
        output += send_and_read(conn, server_ip, 2)

    if "destination filename" in output.lower():
        output += send_and_read(conn, destination_file, 3)

    if "bytes copied" not in output.lower() and "copied in" not in output.lower() and "!" not in output:
        more = wait_read(conn, 5)
        if more:
            output += more

    return output


if len(sys.argv) < 2:
    fail("Missing required argument: router_name")

router_name = sys.argv[1].strip().upper()
config_type = sys.argv[2].strip().lower() if len(sys.argv) > 2 else "both"

if router_name not in ROUTERS:
    fail("Unsupported router_name", router_name=router_name, supported=list(ROUTERS.keys()))

if config_type not in {"running", "startup", "both"}:
    fail("config_type must be one of: running, startup, both", router_name=router_name, config_type=config_type)

router = ROUTERS[router_name]
completed = []

try:
    firewall = {
        "device_type": "fortinet",
        "host": "<FORTIGATE_MGMT_IP>",
        "username": "<DEVICE_USERNAME>",
        "password": "<DEVICE_PASSWORD>",
        "fast_cli": False,
    }

    fw_conn = ConnectHandler(**firewall)
    debug("Connected to firewall jump host")

    output = send_and_read(fw_conn, f"execute ssh {router['ssh_user']}@{router['ssh_host']}", 2)

    if "yes/no" in output.lower():
        output += send_and_read(fw_conn, "yes", 2)

    if "password" in output.lower():
        output += send_and_read(fw_conn, router["ssh_password"], 2)

    debug(f"Router login output:\n{output}")

    send_and_read(fw_conn, "terminal length 0", 1)

    ping_output = send_and_read(fw_conn, f"ping {TFTP_SERVER_IP}", 4)
    debug(f"Ping output:\n{ping_output}")

    if "success rate is 0 percent" in ping_output.lower() or "unreachable" in ping_output.lower():
        send_and_read(fw_conn, "exit", 1)
        fw_conn.disconnect()
        fail(
            "Router cannot reach TFTP server",
            router_name=router_name,
            tftp_server_ip=TFTP_SERVER_IP,
            ping_output=ping_output,
        )

    if config_type in {"running", "both"}:
        debug("Starting running-config backup")
        running_output = handle_interactive_copy(
            fw_conn,
            "copy running-config tftp:",
            TFTP_SERVER_IP,
            router["running_file"],
        )
        debug(f"Running-config copy output:\n{running_output}")
        completed.append(router["running_file"])

    if config_type in {"startup", "both"}:
        debug("Starting startup-config backup")
        startup_output = handle_interactive_copy(
            fw_conn,
            "copy startup-config tftp:",
            TFTP_SERVER_IP,
            router["startup_file"],
        )
        debug(f"Startup-config copy output:\n{startup_output}")
        completed.append(router["startup_file"])

    send_and_read(fw_conn, "exit", 1)
    fw_conn.disconnect()

    success(
        f"Backup completed for {router_name}",
        router_name=router_name,
        config_type=config_type,
        tftp_server_ip=TFTP_SERVER_IP,
        tftp_path=TFTP_BASE_PATH,
        files=completed,
    )

except Exception as e:
    try:
        fw_conn.disconnect()
    except Exception:
        pass
    fail(
        f"Backup failed: {str(e)}",
        router_name=router_name,
        config_type=config_type,
        tftp_server_ip=TFTP_SERVER_IP,
    )
