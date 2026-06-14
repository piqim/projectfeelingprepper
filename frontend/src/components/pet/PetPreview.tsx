interface PetPreviewProps {
  type: "fish" | "seal";
}

/**
 * Static small-size pet thumbnail used in the pet-selection modal.
 * Always renders in the happy/neutral resting pose — no mood variation needed.
 */
const PetPreview = ({ type }: PetPreviewProps) => {
  if (type === "seal") {
    return (
      <svg viewBox="0 0 120 100" className="w-20 h-20" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="25" cy="78" rx="8" ry="9" transform="rotate(30 25 78)" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="2" />
        <ellipse cx="110" cy="80" rx="7" ry="9" transform="rotate(105 110 78)" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="2" />
        <ellipse cx="58" cy="88" rx="9" ry="7" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="2" />
        <path
          d="M 22 52 Q 18 91 49 88 Q 101 96 108 77 Q 112 51 74.5 50.5 Q 71.5 17.5 47.5 17.5 Q 23.5 17.5 22 52"
          fill="#9BB7BD"
          stroke="#5C6F75"
          strokeWidth="3"
        />
        <circle cx="38" cy="40" r="5" fill="#222" />
        <circle cx="58" cy="40" r="5" fill="#222" />
        <circle cx="39.5" cy="38.5" r="2" fill="white" />
        <circle cx="59.5" cy="38.5" r="2" fill="white" />
        <ellipse cx="48" cy="52" rx="3" ry="2" fill="#444" />
        <path d="M 41 55 Q 45 60 48 54 Q 51 60 55 55" stroke="#444" strokeWidth="2" fill="none" />
        <path d="M 34 32 Q 38 30 42 32" stroke="#5C6F75" strokeWidth="2" fill="none" />
        <path d="M 54 32 Q 58 30 62 32" stroke="#5C6F75" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 100" className="w-20 h-20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 38 18 L 33 90 L 42 90 L 51 66 L 57 66 L 65 90 L 75 90 L 70 18 L 38 18"
        fill="#0281A7"
        stroke="#222089"
        strokeWidth="3"
      />
      <ellipse cx="55" cy="35" rx="35" ry="25" fill="#FF7F50" stroke="#222089" strokeWidth="3" />
      <path d="M 23 45 Q 44 48 55 38" stroke="#222089" strokeWidth="2" fill="none" />
      <path
        d="M 85 35 Q 100 25, 95 35 Q 100 45, 85 35"
        fill="#FF7F50"
        stroke="#222089"
        strokeWidth="3"
      />
      <circle cx="45" cy="30" r="8" fill="white" stroke="#222089" strokeWidth="2" />
      <circle cx="45" cy="30" r="4" fill="#222089" />
      <path d="M 65 30 Q 70 35, 65 40" stroke="#222089" strokeWidth="2" fill="none" />
      <path d="M 70 32 Q 75 37, 70 42" stroke="#222089" strokeWidth="2" fill="none" />
    </svg>
  );
};

export default PetPreview;
