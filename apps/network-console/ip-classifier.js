export function parseIPv4(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map(part => /^\d{1,3}$/.test(part) ? Number(part) : -1);
  return octets.every(value => value >= 0 && value <= 255) ? octets : null;
}

export function parseIPv6(ip) {
  if (!ip.includes(":") || ip.includes("%")) return null;
  let source = ip.toLowerCase();
  if (source.includes(".")) {
    const lastColon = source.lastIndexOf(":");
    if (lastColon < 0) return null;
    const ipv4 = parseIPv4(source.slice(lastColon + 1));
    if (!ipv4) return null;
    source = source.slice(0, lastColon + 1)
      + ((ipv4[0] << 8) | ipv4[1]).toString(16)
      + ":"
      + ((ipv4[2] << 8) | ipv4[3]).toString(16);
  }
  if ((source.match(/::/g) || []).length > 1) return null;
  const sides = source.split("::");
  const left = sides[0] ? sides[0].split(":") : [];
  const right = sides.length > 1 && sides[1] ? sides[1].split(":") : [];
  if ([...left, ...right].some(group => !/^[0-9a-f]{1,4}$/.test(group))) return null;
  const missing = 8 - left.length - right.length;
  if ((sides.length === 1 && missing !== 0) || (sides.length === 2 && missing < 1)) return null;
  return [
    ...left.map(group => parseInt(group, 16)),
    ...Array(Math.max(0, missing)).fill(0),
    ...right.map(group => parseInt(group, 16))
  ];
}

export function classifyIP(ip) {
  const ipv4 = parseIPv4(ip);
  if (ipv4) {
    const [a, b] = ipv4;
    if (a === 127) return { family: 4, scope: "loopback", note: "IPv4 loopback range" };
    if (a === 169 && b === 254) return { family: 4, scope: "link-local", note: "IPv4 link-local range" };
    if (a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31)) {
      return { family: 4, scope: "local/intranet", note: "Common RFC1918 private IPv4 range" };
    }
    return { family: 4, scope: "other/global-or-special", note: "Not in the common private, loopback or link-local ranges; reserved/special ranges are not fully modeled offline" };
  }
  const ipv6 = parseIPv6(ip);
  if (!ipv6) return null;
  if (ipv6.every(value => value === 0) && ipv6[7] === 1) {
    return { family: 6, scope: "loopback", note: "IPv6 loopback address" };
  }
  if (ipv6.every(value => value === 0)) {
    return { family: 6, scope: "unspecified", note: "IPv6 unspecified address" };
  }
  if ((ipv6[0] & 0xfe00) === 0xfc00) {
    return { family: 6, scope: "local/intranet", note: "IPv6 unique-local range fc00::/7" };
  }
  if ((ipv6[0] & 0xffc0) === 0xfe80) {
    return { family: 6, scope: "link-local", note: "IPv6 link-local range fe80::/10" };
  }
  return { family: 6, scope: "other/global-or-special", note: "Not in the common private, loopback or link-local ranges; reserved/special ranges are not fully modeled offline" };
}
