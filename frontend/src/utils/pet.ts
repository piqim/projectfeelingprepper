/**
 * XP required to *reach* each level — index is the target level.
 * Mirrored from the backend so the XP bar stays accurate without an extra fetch.
 */
export const LEVEL_THRESHOLDS = [0, 0, 50, 120, 220, 350, 520, 730, 990, 1300, 1670];

export const MAX_LEVEL = 10;

/**
 * True when two Date values fall on the same UTC calendar day.
 * Used for streak and feeding checks — UTC prevents midnight-timezone bugs
 * where a feed at 11 PM local might look like "yesterday" to the server.
 */
export const isSameUTCDay = (a: Date, b: Date): boolean =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

/**
 * Derives the pet's visible mood from its last-fed timestamp without a
 * network call. The minute-tick in Home re-invokes this every 60 s so the
 * pet can flip moods as time elapses without a page refresh.
 *
 * Fed within 12 h → happy, within 24 h → neutral, older or never → sad.
 * Thresholds mirror the backend 12-hour feeding cooldown.
 */
export const getDerivedPetStatus = (
  lastFed?: string | Date | null
): "happy" | "neutral" | "sad" => {
  if (!lastFed) return "sad";
  const msAgo = Date.now() - new Date(lastFed).getTime();
  if (msAgo < 12 * 60 * 60 * 1000) return "happy";
  if (msAgo < 24 * 60 * 60 * 1000) return "neutral";
  return "sad";
};
