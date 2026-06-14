import { useState, useEffect } from "react";
import config from "../../config";
import Toast from "../Toast";
import { useToast } from "../../hooks/useToast";
import { fireConfetti } from "../../hooks/useConfetti";
import { formatFriendlyDateTime } from "../../utils/date";
import { getStoredUserId } from "../../utils/userId";

interface GrapesEntry {
  _id?: string;
  date: string;
  gentle: string;
  recreation: string;
  accomplishment: string;
  pleasure: string;
  exercise: string;
  social: string;
  completed: boolean;
}

type GrapesField = "gentle" | "recreation" | "accomplishment" | "pleasure" | "exercise" | "social";

/**
 * Grapes — daily GRAPES activity tracker.
 *
 * Lets the user record one activity per GRAPES category, then save as
 * "completed" (all 6 filled) or "partial". Entries are immutable after saving.
 * History is fetched on mount and refreshed whenever the history modal opens.
 */

// Drives the input grid — letter badge, label, and placeholder in one place
// so adding or reordering categories only requires changing this array.
const GRAPES_FIELDS: { key: GrapesField; letter: string; label: string; placeholder: string }[] = [
  { key: "gentle",         letter: "G", label: "Gentle-to-Self", placeholder: "ie. comforted me" },
  { key: "recreation",     letter: "R", label: "Recreation",     placeholder: "ie. played a game" },
  { key: "accomplishment", letter: "A", label: "Accomplishment", placeholder: "ie. won a game" },
  { key: "pleasure",       letter: "P", label: "Pleasure",       placeholder: "ie. ate a burger" },
  { key: "exercise",       letter: "E", label: "Exercise",       placeholder: "ie. benched 220 lbs" },
  { key: "social",         letter: "S", label: "Social",         placeholder: "ie. hung out w/ fam" },
];

const Grapes = () => {
  const API_URL = config.API_URL;

  const [entries, setEntries] = useState({
    gentle: "",
    recreation: "",
    accomplishment: "",
    pleasure: "",
    exercise: "",
    social: "",
  });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<GrapesEntry | null>(null);
  const [isFullyFilled, setIsFullyFilled] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<GrapesEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { message, type, visible, showToast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const userId = getStoredUserId();
    if (!userId) {
      console.error("No userId found");
      return;
    }

    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_URL}/grapes/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setHistoryEntries(data);
      } else {
        showToast("Failed to load history. Please try again.", "error");
      }
    } catch {
      showToast("Error loading history. Please check your connection.", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (category: keyof typeof entries, value: string) => {
    setEntries({ ...entries, [category]: value });
  };

  /**
   * Opens the save confirmation modal.
   * Sets `isFullyFilled` so the modal shows the correct copy and button variant:
   * all-6-filled → "Done / Nope", partial → "Save Partial / Nope".
   */
  const handleSaveClick = () => {
    const hasContent = Object.values(entries).some((val) => val.trim() !== "");
    if (!hasContent) {
      showToast("Please fill in at least one activity before saving.", "error");
      return;
    }
    const allFieldsFilled = Object.values(entries).every((val) => val.trim() !== "");
    setIsFullyFilled(allFieldsFilled);
    setShowSaveModal(true);
  };

  const handleConfirmSave = async (completed: boolean) => {
    const userId = getStoredUserId();
    if (!userId) {
      showToast("You must be logged in to save entries.", "error");
      setShowSaveModal(false);
      return;
    }

    setIsSaving(true);

    const dataToSave = {
      userId,
      date: new Date().toISOString(),
      // localDate is ISO date-only in the user's local timezone (YYYY-MM-DD).
      // The backend uses this — not `date` — to determine "today's" entry so
      // a save at 11 PM local time isn't counted as the next UTC day.
      localDate: new Date().toLocaleDateString("en-CA"),
      gentle: entries.gentle,
      recreation: entries.recreation,
      accomplishment: entries.accomplishment,
      pleasure: entries.pleasure,
      exercise: entries.exercise,
      social: entries.social,
      completed,
    };

    try {
      const response = await fetch(`${API_URL}/grapes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        const data = await response.json();
        setEntries({ gentle: "", recreation: "", accomplishment: "", pleasure: "", exercise: "", social: "" });
        await fetchHistory();
        setShowSaveModal(false);
        showToast("Saved — nice work today 💜", "success");
        if (completed) fireConfetti("big");
        if (data.leveledUp) {
          showToast(`Level up! Your pet is now level ${data.newLevel}!`, "success");
          fireConfetti("big");
        }
        if (data.streakUpdated === false) {
          showToast("Entry saved, but your streak couldn't be updated right now.", "info");
        }
      } else {
        const error = await response.json();
        showToast(`Failed to save: ${error.error || "Unknown error"}`, "error");
      }
    } catch {
      showToast("Error saving entry. Please check your connection.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewHistory = () => {
    setShowHistoryModal(true);
    fetchHistory();
  };

  const handleHistoryEntryClick = (entry: GrapesEntry) => {
    setSelectedHistoryEntry(entry);
  };

  /**
   * Closes any open modal when the user taps the backdrop.
   * The `e.target === e.currentTarget` guard ensures clicks on the modal card
   * itself don't bubble up and accidentally dismiss it.
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowSaveModal(false);
      setShowHistoryModal(false);
      setSelectedHistoryEntry(null);
    }
  };

  const filledCount = Object.values(entries).filter((val) => val.trim() !== "").length;

  return (
    <div className="bg-neutral pb-24">
      <Toast message={message} type={type} visible={visible} />
      {/* Header */}
      <div className="bg-primary-light p-4 text-center">
        <h1 className="text-2xl font-bold text-highlight montserrat-alternates">
          GRAPES Daily Tracker
        </h1>
      </div>

      {/* Progress hint */}
      <div className="px-5 mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink/60">Fill in today's activities</p>
        <span className="text-sm font-bold text-ink">{filledCount}/6</span>
      </div>

      {/* GRAPES grid with faint vine watermark */}
      <div className="relative mt-3">
        {/* Faint grapevine — purely decorative, sits behind the grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.25]"
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Branches */}
          <g fill="none" stroke="#6F9A4B" strokeLinecap="round">
            <path d="M 40 5 Q 130 110 95 235 Q 60 360 205 430 Q 345 495 360 600" strokeWidth="7" />
            <path d="M 95 235 Q 160 225 215 175" strokeWidth="5" />
            <path d="M 205 430 Q 255 388 305 398" strokeWidth="5" />
          </g>
          {/* Leaves */}
          <g fill="#6F9A4B">
            <ellipse cx="216" cy="172" rx="15" ry="8" transform="rotate(-32 216 172)" />
            <ellipse cx="306" cy="395" rx="15" ry="8" transform="rotate(22 306 395)" />
            <ellipse cx="78" cy="150" rx="13" ry="7" transform="rotate(-10 78 150)" />
          </g>
          {/* Grape clusters */}
          <g fill="#9B5FB8">
            {/* top-right cluster */}
            <circle cx="300" cy="80" r="9" />
            <circle cx="287" cy="96" r="9" />
            <circle cx="313" cy="96" r="9" />
            <circle cx="300" cy="112" r="9" />
            <circle cx="287" cy="128" r="9" />
            <circle cx="313" cy="128" r="9" />
            <circle cx="300" cy="144" r="9" />
            {/* bottom-left cluster */}
            <circle cx="120" cy="320" r="8" />
            <circle cx="108" cy="334" r="8" />
            <circle cx="132" cy="334" r="8" />
            <circle cx="120" cy="348" r="8" />
            <circle cx="108" cy="362" r="8" />
            <circle cx="132" cy="362" r="8" />
          </g>
        </svg>

        <div className="relative grid grid-cols-2 gap-x-4 gap-y-5 px-5">
        {GRAPES_FIELDS.map(({ key, letter, label, placeholder }) => {
          const filled = entries[key].trim() !== "";
          return (
            <div key={key} className="flex flex-col items-center text-center">
              {/* Grape badge */}
              <div
                className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2 transition-all duration-200 ${
                  filled
                    ? "bg-[#A86FC4] text-white ring-2 ring-[#7B40A8] ring-offset-2"
                    : "bg-secondary text-dark"
                }`}
              >
                {letter}
                {filled && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-3 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-[10px] font-bold leading-none">✓</span>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="text-xs font-bold text-ink mb-2 leading-tight min-h-[2rem] flex items-center">
                {label}
              </div>

              {/* Input */}
              <input
                type="text"
                value={entries[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full text-sm font-semibold px-3 py-2 rounded-xl bg-surface border border-line text-ink placeholder:text-muted text-center shadow-sm focus:border-secondary focus:outline-none transition-colors"
              />
            </div>
          );
        })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mt-8 flex gap-4 max-w-md mx-auto">
        <button
          onClick={handleSaveClick}
          className="flex-1 bg-primary-light text-highlight text-xl font-bold py-4 rounded-2xl border-b-4 border-primary-light active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
        >
          Save Entry
        </button>
        <button
          onClick={handleViewHistory}
          className="flex-1 bg-primary-light text-highlight text-xl font-bold py-4 rounded-2xl border-b-4 border-primary-light active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
        >
          See History
        </button>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-surface rounded-2xl p-4 max-w-sm w-full shadow-2xl">
            {isFullyFilled ? (
              <>
                <h2 className="text-2xl font-bold text-ink mb-2">
                  All 6 activities filled! ✓
                </h2>
                <p className="text-muted font-semibold text-lg">
                  Have you completed all of the activities?
                </p>
                <p className="text-muted mb-6 text-xs font-medium">
                  Heads up — entries can't be edited once saved.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                    }}
                    className="flex-1 bg-gray-200 dark:bg-surface-2 text-dark dark:text-ink text-lg font-bold py-3 rounded-lg border-b-4 border-gray-400 dark:border-line active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
                  >
                    Nope
                  </button>
                  <button
                    onClick={() => handleConfirmSave(true)}
                    disabled={isSaving}
                    className="flex-1 bg-primary-light text-highlight text-lg font-bold py-3 rounded-lg border-b-4 border-primary-base active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75 disabled:opacity-60 disabled:active:translate-y-0 disabled:active:border-b-4"
                  >
                    {isSaving ? "Saving..." : "Done ✓"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-ink mb-2">
                  Confirm Partial Entry?
                </h2>
                <p className="text-muted  mb-2 text-lg font-semibold">
                  You haven't filled in all 6 GRAPES activities. Are you sure you want to save this as finished for today?
                </p>
                <p className="text-muted mb-6 text-xs font-medium">
                  Heads up — entries can't be edited once saved.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-surface-2 text-dark dark:text-ink text-lg font-bold py-3 rounded-lg border-b-4 border-gray-400 dark:border-line active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
                  >
                    Nope
                  </button>
                  <button
                    onClick={() => handleConfirmSave(false)}
                    disabled={isSaving}
                    className="flex-1 bg-yellow-500 text-dark text-lg font-bold py-3 rounded-lg border-b-4 border-yellow-700 active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75 disabled:opacity-60 disabled:active:translate-y-0 disabled:active:border-b-4"
                  >
                    {isSaving ? "Saving..." : "Save Partial"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && !selectedHistoryEntry && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-ink">Entry History</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-muted hover:text-ink"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loadingHistory ? (
              <div className="text-center py-8">
                <p className="text-muted">Loading history...</p>
              </div>
            ) : historyEntries.length === 0 ? (
              <p className="text-muted text-center py-8">
                No history entries yet. Start tracking your GRAPES activities!
              </p>
            ) : (
              <div className="space-y-3">
                {historyEntries.map((entry) => (
                  <button
                    key={entry._id}
                    onClick={() => handleHistoryEntryClick(entry)}
                    className="w-full bg-secondary/20 hover:bg-secondary/30 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-ink">
                          {formatFriendlyDateTime(entry.date)}
                        </div>
                        <div className="text-sm font-medium text-muted mt-1">
                          {[
                            entry.gentle,
                            entry.recreation,
                            entry.accomplishment,
                            entry.pleasure,
                            entry.exercise,
                            entry.social,
                          ].filter((val) => val && val.trim() !== "").length}{" "}
                          activities logged
                        </div>
                      </div>
                      <div>
                        {entry.completed ? (
                          <span className="bg-accent-3 text-white text-sm px-2 py-1 rounded-full">
                            ✓ Completed
                          </span>
                        ) : (
                          <span className="bg-gray-300 dark:bg-ink/15 text-gray-700 dark:text-ink text-sm px-2 py-1 rounded-full">
                            Partial
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Detail Modal */}
      {selectedHistoryEntry && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink">
                {formatFriendlyDateTime(selectedHistoryEntry.date)}
              </h2>
              <button
                onClick={() => setSelectedHistoryEntry(null)}
                className="text-muted hover:text-ink"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: "gentle", label: "Gentle-to-Self", color: "bg-secondary" },
                { key: "recreation", label: "Recreation", color: "bg-secondary" },
                {
                  key: "accomplishment",
                  label: "Accomplishment",
                  color: "bg-secondary",
                },
                { key: "pleasure", label: "Pleasure", color: "bg-secondary" },
                { key: "exercise", label: "Exercise", color: "bg-secondary" },
                { key: "social", label: "Social", color: "bg-secondary" },
              ].map(({ key, label, color }) => {
                const activity =
                  selectedHistoryEntry[key as keyof Omit<GrapesEntry, "_id" | "date" | "completed">];
                return (
                  <div key={key}>
                    <div className="font-bold text-ink mb-2">
                      {label}
                    </div>
                    {activity && activity.trim() !== "" ? (
                      <div className={`${color}/20 px-3 py-2 rounded-lg text-sm text-ink`}>
                        {activity}
                      </div>
                    ) : (
                      <p className="text-muted text-sm italic">
                        No activity recorded
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-line">
              <button
                onClick={() => setSelectedHistoryEntry(null)}
                className="w-full text-lg bg-primary-light text-highlight font-bold py-3 rounded-lg hover:bg-primary-base transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grapes;