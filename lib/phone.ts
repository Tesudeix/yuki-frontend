export const normalizePhoneForE164 = (raw: string): string => {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  if (trimmed.startsWith("+")) {
    // Keep leading + if present
    return `+${digits}`;
  }

  // No country prefix: keep digits as-is (supports accounts like 94641031)
  return digits;
};

export const isValidPhoneInput = (value: string): boolean => {
  const s = String(value || "").trim();
  const digits = s.replace(/\D/g, "");
  // Accept 8-15 digits, with or without a leading + in input
  return /^\+?\d{8,15}$/.test(s.replace(/\s/g, "")) && digits.length >= 8 && digits.length <= 15;
};
