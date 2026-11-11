import "server-only";
import { isIP } from "node:net";

/** Conservative public-unicast check. No fallback to forwarded lists or server IP. */
export function approvedClientAddress(request: Request, allowDocumentationRanges = false): string | null {
  const value = request.headers.get("x-real-ip");
  if (!value || value.length > 45 || value.trim() !== value || /[\s,%]/.test(value)) return null;
  const version = isIP(value);
  if (version === 4) {
    const [a, b, c] = value.split(".").map(Number);
    const documentation = (a === 192 && b === 0 && c === 2) || (a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113);
    if (documentation) return allowDocumentationRanges ? value : null;
    if (a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || (b === 0 && c === 0) || (b === 88 && c === 99))) || (a === 198 && (b === 18 || b === 19))) return null;
    return value;
  }
  if (version === 6 && !value.includes(".")) {
    const groups = value.toLowerCase().split(":");
    const first = Number.parseInt(groups[0], 16), second = Number.parseInt(groups[1] || "0", 16);
    if (first === 0x2001 && second === 0xdb8) return allowDocumentationRanges ? value : null;
    // Only 2000::/3 global unicast; reject special-purpose, transition and
    // documentation allocations even when their enclosing prefix is global.
    if (!Number.isFinite(first) || !Number.isFinite(second) || first < 0x2000 || first > 0x3fff || first === 0x2002 || first === 0x3fff || (first === 0x2001 && second <= 0x1ff)) return null;
    return value;
  }
  return null;
}
