import confetti from "canvas-confetti";

/**
 * Trigger a burst of branded confetti.
 *
 * @param type
 *   - `"big"` — 120 particles, wide spread; used for milestone streaks (7 / 14 / 30 days).
 *   - `"small"` — 50 particles, tighter spread; used for completing a GRAPES or CogTri entry.
 *
 * Colors match the app palette: turquoise, lavender, orange, yellow, green, cream.
 */
export const fireConfetti = (type: "big" | "small" = "big") => {
  if (type === "big") {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#02AFB9", "#D4A7E1", "#F86E2E", "#FCE18D", "#A7CC81", "#FDFDFD"],
    });
  } else {
    confetti({
      particleCount: 50,
      spread: 55,
      origin: { y: 0.6 },
      colors: ["#02AFB9", "#D4A7E1", "#A7CC81"],
    });
  }
};
