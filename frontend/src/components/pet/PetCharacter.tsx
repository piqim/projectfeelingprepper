interface PetCharacterProps {
  /** Stored pet type from `user.petStats.type`. Null/undefined renders nothing. */
  type: string | null | undefined;
  /** Drives facial expression — derived from last-fed timestamp via `getDerivedPetStatus`. */
  mood: "happy" | "neutral" | "sad";
}

/**
 * Animated full-size pet for the Home hero scene.
 * Renders null when no pet type has been chosen yet.
 *
 * The blob shadow is a sibling to the `fp-bob` wrapper (not inside it) so the
 * pet bobs independently while the shadow stays grounded. `fp-shadow` scales it
 * in sync with the bob to simulate the pet rising and falling above the ground.
 */
const PetCharacter = ({ type, mood }: PetCharacterProps) => {
  if (type === "seal") {
    const sealMouth =
      mood === "happy"
        ? "M 41 55 Q 45 60 48 54 Q 51 60 55 55"
        : mood === "neutral"
        ? "M 42 57 L 54 57"
        : "M 42 59 Q 48 53 54 59";
    const sealBrowL =
      mood === "sad"
        ? "M 34 30 Q 38 33 42 34"
        : mood === "neutral"
        ? "M 34 31 L 42 31"
        : "M 34 32 Q 38 30 42 32";
    const sealBrowR =
      mood === "sad"
        ? "M 62 30 Q 58 33 54 34"
        : mood === "neutral"
        ? "M 54 31 L 62 31"
        : "M 54 32 Q 58 30 62 32";
    const sealEyeCy = mood === "sad" ? 41 : 40;

    return (
      <div className="relative z-10" id="seal">
        {/* Ground shadow — stays fixed, scales with fp-shadow to fake depth */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <div className="fp-shadow w-28 h-5 bg-black/80 rounded-full blur" />
        </div>
        <div className="fp-bob">
          <svg
            viewBox="0 0 120 100"
            className="w-36 h-36"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="25" cy="78" rx="8" ry="9" transform="rotate(30 25 78)" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="2" />
            <ellipse cx="110" cy="80" rx="7" ry="9" transform="rotate(105 110 78)" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="2" />
            <ellipse cx="58" cy="88" rx="9" ry="7" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="2" />
            <path
              d="M 22 52 Q 18 91 49 88 Q 101 96 108 77 Q 112 51 74.5 50.5 Q 71.5 17.5 47.5 17.5 Q 23.5 17.5 22 52"
              fill="#9BB7BD"
              stroke="#5C6F75"
              strokeWidth="3"
            />
            <circle cx="38" cy={sealEyeCy} r="5" fill="#222" />
            <circle cx="58" cy={sealEyeCy} r="5" fill="#222" />
            <circle cx="39.5" cy={sealEyeCy - 1.5} r="2" fill="white" />
            <circle cx="59.5" cy={sealEyeCy - 1.5} r="2" fill="white" />
            {mood === "happy" && (
              <>
                <ellipse cx="30" cy="48" rx="4" ry="2.5" fill="#F86E2E" opacity="0.35" />
                <ellipse cx="66" cy="48" rx="4" ry="2.5" fill="#F86E2E" opacity="0.35" />
              </>
            )}
            <ellipse cx="48" cy="52" rx="3" ry="2" fill="#444" />
            <path d={sealMouth} stroke="#444" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d={sealBrowL} stroke="#5C6F75" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d={sealBrowR} stroke="#5C6F75" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  if (type === "fish") {
    const fishBrow =
      mood === "sad"
        ? "M 39 16 Q 45 21 51 21"
        : mood === "neutral"
        ? "M 39 19 L 51 19"
        : "M 39 19 Q 45 16 51 19";
    const fishMouth =
      mood === "happy"
        ? "M 22 43 Q 28 49 34 44"
        : mood === "neutral"
        ? "M 24 45 L 32 45"
        : "M 22 47 Q 28 42 34 47";

    return (
      <div className="relative z-10" id="fish">
        {/* Ground shadow — stays fixed, scales with fp-shadow to fake depth */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <div className="fp-shadow w-20 h-3 bg-black/40 rounded-full blur" />
        </div>
        <div className="fp-bob">
          <svg
            viewBox="0 0 120 100"
            className="w-36 h-36"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="fp-tailwag"
              d="M 85 35 Q 100 25, 95 35 Q 100 45, 85 35"
              fill="#FF7F50"
              stroke="#222089"
              strokeWidth="3"
            />
            <path
              d="M 38 18 L 33 90 L 42 90 L 51 66 L 57 66 L 65 90 L 75 90 L 70 18 L 38 18"
              fill="#0281A7"
              stroke="#222089"
              strokeWidth="3"
            />
            <ellipse cx="55" cy="35" rx="35" ry="25" fill="#FF7F50" stroke="#222089" strokeWidth="3" />
            <path d="M 23 45 Q 44 48 55 38" stroke="#222089" strokeWidth="2" fill="none" />
            {mood === "happy" && (
              <ellipse cx="38" cy="40" rx="5" ry="3" fill="#222089" opacity="0.12" />
            )}
            <circle cx="45" cy="30" r="8" fill="white" stroke="#222089" strokeWidth="2" />
            <ellipse className="fp-blink" cx="45" cy="30" rx="4" ry="4" fill="#222089" />
            <path d={fishBrow} stroke="#222089" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d={fishMouth} stroke="#222089" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 65 30 Q 70 35, 65 40" stroke="#222089" strokeWidth="2" fill="none" />
            <path d="M 70 32 Q 75 37, 70 42" stroke="#222089" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    );
  }

  return null;
};

export default PetCharacter;
