import type { DeviceType } from "@/lib/types";

function resolveDeviceType(userAgent: string | null | undefined): DeviceType {
  const value = (userAgent ?? "").toLowerCase();

  if (/ipad|tablet|playbook|silk/.test(value)) {
    return "tablet";
  }

  if (/mobile|iphone|ipod|android/.test(value)) {
    return "mobile";
  }

  return "desktop";
}

export function getDeviceTypeFromUserAgent(
  userAgent: string | null | undefined
): DeviceType {
  return resolveDeviceType(userAgent);
}

export function detectDeviceType(): DeviceType {
  if (typeof navigator === "undefined") {
    return "desktop";
  }

  return resolveDeviceType(navigator.userAgent);
}
