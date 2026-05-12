// Workflow: Proxmox Admin Bot (tNl89wvBdjLdJfHK)
// Node: Code in JavaScript3
// Node type: n8n-nodes-base.code

// Proxmox guest-agent network-get-interfaces result
const interfaces =
  $json.data?.result ??
  [];

// Helper: is usable IPv4?
function isValidIPv4(ip) {
  return (
    /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) &&
    !ip.startsWith("127.") &&
    !ip.startsWith("169.254.")
  );
}

let selectedIP = null;
let selectedIface = null;

// Preferred interface name order
const preferredIfaces = ["ens", "eth", "enp"];

for (const iface of interfaces) {
  const name = iface.name || "";

  // Skip loopback and bridges explicitly
  if (name === "lo" || name.startsWith("virbr")) continue;

  const ips = iface["ip-addresses"] || [];

  for (const entry of ips) {
    if (entry["ip-address-type"] === "ipv4") {
      const ip = entry["ip-address"];
      if (isValidIPv4(ip)) {
        selectedIP = ip;
        selectedIface = name;
        break;
      }
    }
  }

  if (selectedIP) break;
}

// Fallback: any valid IPv4 anywhere
if (!selectedIP) {
  for (const iface of interfaces) {
    const ips = iface["ip-addresses"] || [];
    for (const entry of ips) {
      if (
        entry["ip-address-type"] === "ipv4" &&
        isValidIPv4(entry["ip-address"])
      ) {
        selectedIP = entry["ip-address"];
        selectedIface = iface.name;
        break;
      }
    }
    if (selectedIP) break;
  }
}

// ❌ No usable IP found
if (!selectedIP) {
  return [{
    json: {
      ...$json,
      error: true,
      message:
        "⚠️ VM is running but no usable IPv4 address was found.\n" +
        "Ensure the VM has DHCP or a static IP configured.",
      ipSource: "guest-agent"
    }
  }];
}

// ✅ Success
return [{
  json: {
    ...$json,
    vmIP: selectedIP,
    vmInterface: selectedIface,
    ipSource: "guest-agent"
  }
}];

