/**
 * Returns true if `value` is a 24-character hex MongoDB ObjectId.
 */
export const isValidObjectId = (value: string): boolean =>
  /^[a-fA-F0-9]{24}$/.test(value);

/**
 * Extracts a clean MongoDB ObjectId string from any of the serialized forms
 * the backend may return: plain hex string, JSON-stringified `{"$oid":"..."}`,
 * or a BSON object `{ $oid: "..." }`.
 *
 * Returns null if no valid 24-char hex ID can be found.
 */
export const extractMongoId = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (isValidObjectId(trimmed)) return trimmed;

    // Handle JSON-stringified BSON: '{"$oid":"abc123..."}'
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (
          parsed &&
          typeof parsed === "object" &&
          "$oid" in parsed &&
          typeof (parsed as { $oid?: unknown }).$oid === "string"
        ) {
          const oid = (parsed as { $oid: string }).$oid;
          return isValidObjectId(oid) ? oid : null;
        }
      } catch {
        // not valid JSON — fall through
      }
    }

    return null;
  }

  // Handle plain BSON object: { $oid: "abc123..." }
  if (value && typeof value === "object" && "$oid" in value) {
    const oid = (value as { $oid?: unknown }).$oid;
    if (typeof oid === "string" && isValidObjectId(oid)) return oid;
  }

  return null;
};

/**
 * Reads the current user's ID from localStorage, normalizing it in place
 * if it was stored in a non-plain-hex form (e.g. BSON-wrapped).
 *
 * Returns null if the stored value is absent or not a valid ObjectId.
 */
export const getStoredUserId = (): string | null => {
  const stored = localStorage.getItem("userId");
  if (!stored) return null;
  const normalized = extractMongoId(stored);
  if (!normalized) return null;
  if (stored !== normalized) localStorage.setItem("userId", normalized);
  return normalized;
};
