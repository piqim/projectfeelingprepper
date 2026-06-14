// Friendly, low-noise date formatting — warm and human instead of clinical.
// "Today, 2:30 PM" / "Yesterday, 9:05 AM" / "Jun 10, 2:30 PM"

// Uses local calendar day (not UTC) so "Today" matches what the user's clock shows.
const isSameLocalDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const yesterdayOf = (now: Date) => {
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  return y;
};

/** Date + time, e.g. "Today, 2:30 PM" — for cards and history rows. */
export const formatFriendlyDateTime = (input?: string | Date | null): string => {
  if (!input) return "";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (isSameLocalDay(d, now)) return `Today, ${time}`;
  if (isSameLocalDay(d, yesterdayOf(now))) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
};

/** Date only, e.g. "Today" / "Mon, Jun 10" — for compact headers. */
export const formatFriendlyDate = (input?: string | Date | null): string => {
  if (!input) return "";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  if (isSameLocalDay(d, now)) return "Today";
  if (isSameLocalDay(d, yesterdayOf(now))) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};
