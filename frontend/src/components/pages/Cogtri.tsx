import { useState, useEffect } from "react";
import config from "../../config";
import instructionsImg from "../../assets/instructions.jpg";
import Toast from "../Toast";
import { useToast } from "../../hooks/useToast";
import { fireConfetti } from "../../hooks/useConfetti";
import { formatFriendlyDateTime } from "../../utils/date";
import { getStoredUserId } from "../../utils/userId";
import { authHeaders } from "../../utils/auth";

interface CogTriEntry {
  _id?: string;
  date: string;
  situation: string;
  thoughts: string;
  feelings: string;
  behavior: string;
  complete: boolean;
}

/**
 * Cogtri — Cognitive Triangle entry tool.
 *
 * Each entry captures the four CBT fields (situation, thoughts, feelings, behavior)
 * via full-screen tap-to-edit modals rather than inline inputs, keeping the main
 * view uncluttered. Entries are immutable after saving, and only one entry per
 * UTC day is allowed — a duplicate warning interrupts the save flow if needed.
 */
const Cogtri = () => {
  const API_URL = config.API_URL;

  const [entry, setEntry] = useState({
    situation: "",
    thoughts: "",
    feelings: "",
    behavior: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalField, setModalField] = useState<
    "thoughts" | "feelings" | "behavior" | "situation" | null
  >(null);
  // Holds the in-progress edit value; only committed to `entry` on Save, not on every keystroke.
  const [tempValue, setTempValue] = useState("");

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] =
    useState<CogTriEntry | null>(null);
  const [isFullyFilled, setIsFullyFilled] = useState(false);

  // Instructions / About behave as an accordion — exactly one is always open,
  // so the page never collapses into a big empty gap. Choice is persisted.
  const [openSection, setOpenSection] = useState<"instructions" | "about">(
    () => (localStorage.getItem("cogtri-section") === "about" ? "about" : "instructions")
  );

  const selectSection = (section: "instructions" | "about") => {
    setOpenSection(section);
    localStorage.setItem("cogtri-section", section);
  };

  const [historyEntries, setHistoryEntries] = useState<CogTriEntry[]>([]);
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
      const response = await fetch(`${API_URL}/cogtri/user/${userId}`, { headers: authHeaders() });

      if (response.ok) {
        const data = await response.json();
        setHistoryEntries(data);
      } else {
        setHistoryEntries([]);
      }
    } catch {
    } finally {
      setLoadingHistory(false);
    }
  };

  const fieldLabels = {
    thoughts: "Thoughts",
    feelings: "Feelings",
    behavior: "Behavior",
    situation: "Situation",
  };

  const handleOpenModal = (
    field: "thoughts" | "feelings" | "behavior" | "situation"
  ) => {
    setModalField(field);
    setTempValue(entry[field]);
    setModalOpen(true);
  };

  const handleSaveField = () => {
    if (modalField) {
      setEntry({ ...entry, [modalField]: tempValue });
    }
    setModalOpen(false);
    setTempValue("");
  };

  const handleCancelField = () => {
    setModalOpen(false);
    setTempValue("");
  };

  /**
   * Opens the save confirmation modal (or a duplicate-entry warning if the
   * user has already submitted an entry today).
   *
   * The duplicate check compares UTC dates to match the server's perspective —
   * otherwise an entry at 11 PM local might be flagged against a next-UTC-day
   * entry from the server's side.
   */
  const handleSaveClick = () => {
    const hasContent = Object.values(entry).some((val) => val.trim() !== "");
    if (!hasContent) {
      showToast("Please fill in at least one field before saving.", "error");
      return;
    }

    const allFieldsFilled = Object.values(entry).every((val) => val.trim() !== "");
    setIsFullyFilled(allFieldsFilled);

    const today = new Date();
    const hasEntryToday = historyEntries.some((e) => {
      const d = new Date(e.date);
      return (
        d.getUTCFullYear() === today.getUTCFullYear() &&
        d.getUTCMonth() === today.getUTCMonth() &&
        d.getUTCDate() === today.getUTCDate()
      );
    });

    if (hasEntryToday) {
      setShowDuplicateWarning(true);
      return;
    }

    setShowSaveModal(true);
  };

  const handleConfirmSave = async (complete: boolean) => {
    const userId = getStoredUserId();
    if (!userId) {
      showToast("You must be logged in to save entries.", "error");
      setShowSaveModal(false);
      return;
    }

    setIsSaving(true);

    const dataToSave = {
      date: new Date().toISOString(),
      // localDate is ISO date-only in the user's local timezone (YYYY-MM-DD).
      // The backend uses this — not `date` — to determine "today's" entry so
      // a save at 11 PM local time isn't counted as the next UTC day.
      localDate: new Date().toLocaleDateString("en-CA"),
      situation: entry.situation,
      thoughts: entry.thoughts,
      feelings: entry.feelings,
      behavior: entry.behavior,
      complete,
    };

    try {
      const response = await fetch(`${API_URL}/cogtri`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        const data = await response.json();
        setEntry({ situation: "", thoughts: "", feelings: "", behavior: "" });
        await fetchHistory();
        setShowSaveModal(false);
        showToast("Saved — nice work today 💜", "success");
        fireConfetti("small");
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
    // Refresh history when opening modal
    fetchHistory();
  };

  const handleHistoryEntryClick = (entry: CogTriEntry) => {
    setSelectedHistoryEntry(entry);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
      setShowSaveModal(false);
      setShowHistoryModal(false);
      setSelectedHistoryEntry(null);
    }
  };

  return (
    <div className="min-h-dvh bg-neutral flex flex-col pb-24">
      <Toast message={message} type={type} visible={visible} />
      {/* Header */}
      <div className="bg-primary-light p-4 text-center">
        <h1 className="text-2xl font-bold text-highlight montserrat-alternates">
          CogTri
        </h1>
      </div>
      {/* CogTri Section */}
      <div className="bg-primary-base px-4 pt-4 pb-10">

        {/* Triangle Container */}
        <div className="relative w-full max-w-md mx-auto aspect-[1.25] min-[410px]:aspect-[1.5]" >
          {/* SVG Triangle */}
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 0 }}
          >
            {/* White Triangle */}
            <polygon
              points="200, 0 0,350 400,350"
              fill="white"
              stroke="none"
            />
          </svg>

          {/* T - Thoughts (Top) */}
          <button
            onClick={() => handleOpenModal("thoughts")}
            className="top-[0%] min-[410px]:top-[0%]
            absolute bg-accent-3 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold text-dark shadow-lg hover:opacity-80 transition-opacity"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            T
          </button>

          {/* B - Behavior (Bottom Left) */}
          <button
            onClick={() => handleOpenModal("behavior")}
            className="left-[7.5%] min-[410px]:left-[14%]
            absolute bg-accent-2 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold text-dark shadow-lg hover:opacity-80 transition-opacity"
            style={{
              top: "65%",
              zIndex: 10,
            }}
          >
            B
          </button>

          {/* F - Feelings (Bottom Right) */}
          <button
            onClick={() => handleOpenModal("feelings")}
            className="right-[7.5%] min-[410px]:right-[14%]
            absolute bg-accent-1 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold text-dark shadow-lg hover:opacity-80 transition-opacity"
            style={{
              top: "65%",
              zIndex: 10,
            }}
          >
            F
          </button>

          {/* Situation (Center) */}
          <button
            onClick={() => handleOpenModal("situation")}
            className="absolute bg-primary-light text-highlight rounded-full w-28 h-28 flex items-center justify-center text-xl font-bold shadow-lg hover:opacity-80 transition-opacity"
            style={{
              left: "50%",
              top: "55%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            Situation
          </button>
        </div>

        <div className="mx-auto w-86 h-1 bg-primary-light mt-2"></div>

        {/* Action Buttons */}
        <div className="px-6 mt-4 flex gap-4 max-w-md mx-auto">
          <button
            onClick={handleSaveClick}
            className="flex-1 bg-primary-light text-highlight text-xl font-bold py-4 rounded-2xl border-b-4 border-primary-base active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
          >
            Save Entry
          </button>
          <button
            onClick={handleViewHistory}
            className="flex-1 bg-primary-light text-highlight text-xl font-bold py-4 rounded-2xl border-b-4 border-primary-base active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
          >
            See History
          </button>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="px-6 py-4 bg-highlight dark:bg-surface">
        {/* Clickable Header */}
        <button
          onClick={() => selectSection("instructions")}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-ink text-2xl font-bold">Instructions</h2>
          <svg
            className={`w-6 h-6 text-ink transition-transform duration-300 ${openSection === "instructions" ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${openSection === "instructions" ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
        >
          <div className="flex gap-6">
            {/* Left side - Text */}
            <div className="flex-1 font-semibold text-sm">
              <ol className="space-y-3 text-ink">
                <li className="flex gap-3">
                  <span className="font-bold text-primary-light">1.</span>
                  <span>
                    Click on a colored tip to input entry for the action corresponding to that color.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary-light">2.</span>
                  <span>
                    Fill in all three actions (Thoughts, Feelings, Behavior)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary-light">3.</span>
                  <span>
                    Then, click "Save Entry" to save it to your history.
                  </span>
                </li>
              </ol>
            </div>
            {/* Right side - Placeholder for illustration */}
            <div className="flex-1 rounded-lg flex items-baseline justify-center min-h-[200px]">
              <img src={instructionsImg} alt="Instructions Illustration" className="max-w-full max-h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-6 py-4 bg-primary-base">
        {/* Clickable Header */}
        <button
          onClick={() => selectSection("about")}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-highlight text-2xl font-bold">About</h2>
          <svg
            className={`w-6 h-6 text-highlight transition-transform duration-300 ${openSection === "about" ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${openSection === "about" ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
        >
          {/* Main explanation box */}
          <div className="bg-surface rounded-xl rounded-b-none pt-4">
            <p className="text-ink font-bold text-md mb-4 px-4">
              In any situation, we have...
            </p>

            {/* Three colored boxes */}
            <div className="grid grid-cols-3">
              <div className="h-2 bg-accent-3 border-primary-base border-r-2"></div>
              <div className="h-2 bg-accent-1 border-primary-base border-r-2"></div>
              <div className="h-2 bg-accent-2 "></div>
            </div>


            <div className="grid grid-cols-3">
              {/* Thoughts */}
              <div className="bg-primary-light text-highlight p-3 border-r-2 border-primary-base">
                <h3 className="font-bold text-md mb-2">Thoughts</h3>
                <p className="text-sm font-semibold">
                  What thoughts did we have during the situation?
                </p>
              </div>

              {/* Feelings */}
              <div className="bg-primary-light text-highlight p-3 border-r-2 border-primary-base">
                <h3 className="font-bold text-md mb-2">Feelings</h3>
                <p className="text-sm font-semibold">
                  How did the situation make us feel?
                </p>
              </div>

              {/* Behaviors */}
              <div className="bg-primary-light text-highlight p-3">
                <h3 className="font-bold text-md mb-2">Behaviors</h3>
                <p className="text-sm font-semibold">
                  How did we respond to the situation?
                </p>
              </div>
            </div>
          </div>

          {/* Example box */}
          <div className="bg-dark rounded-xl rounded-t-none p-4">
            <h3 className="text-highlight text-md font-bold mb-3">
              Example Situation: Failing an exam
            </h3>

            <div className="space-y-3">
              {/* Example 1 - Negative */}
              <div className="space-y-2">
                <div className="bg-[#F6F0E5]/90 rounded-lg p-2 flex items-center gap-2">
                  <span className="text-2xl">😞</span>
                  <p className="text-sm text-dark italic">
                    "I never do well in this class, why even try?"
                  </p>
                </div>
                <div className="bg-accent-1/80 rounded-lg p-2 flex items-center gap-2">
                  <span className="text-2xl">😔</span>
                  <p className="text-sm text-highlight">
                    Shame, hopelessness
                  </p>
                </div>
                <div className="bg-accent-2/80 rounded-lg p-2 flex items-center gap-2">
                  <span className="text-2xl">😞</span>
                  <p className="text-sm text-dark">
                    Not trying on/studying for future exams
                  </p>
                </div>
              </div>

              {/* Example 2 - Positive */}
              <div className="space-y-2">
                <div className="bg-[#F6F0E5]/90 rounded-lg p-2 flex items-center gap-2">
                  <span className="text-2xl">🙂</span>
                  <p className="text-sm text-dark italic">
                    "I didn't do very well, so I'll study even harder and ace the
                    next one!"
                  </p>
                </div>
                <div className="bg-accent-1/80 rounded-lg p-2 flex items-center gap-2">
                  <span className="text-2xl">😊</span>
                  <p className="text-sm text-highlight">
                    disappointment, determination
                  </p>
                </div>
                <div className="bg-accent-2/80 rounded-lg p-2 flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <p className="text-sm text-dark">
                    Planning ahead to set aside time for study
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Input Modal */}
      {modalOpen && modalField && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-ink">
                {fieldLabels[modalField]}
              </h2>
              <button
                onClick={handleCancelField}
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

            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={`Enter your ${modalField}...`}
              className="w-full border-2 border-line bg-surface-2 text-ink rounded-lg p-3 h-32 resize-none focus:border-primary-light focus:outline-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCancelField}
                className="flex-1 text-lg bg-gray-300 dark:bg-surface-2 text-gray-700 dark:text-ink font-semibold py-3 rounded-lg border-b-4 border-gray-400 dark:border-line active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveField}
                className="flex-1 text-lg bg-primary-light text-highlight font-semibold py-3 rounded-lg border-b-4 border-primary-base active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Day Warning Modal */}
      {showDuplicateWarning && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDuplicateWarning(false)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-ink mb-2">Already saved today</h3>
            <p className="text-sm text-muted mb-6">
              You already have a CogTri entry for today. Save another one anyway?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDuplicateWarning(false)}
                className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-surface-2 text-dark dark:text-ink font-semibold text-sm border-b-4 border-gray-400 dark:border-line active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDuplicateWarning(false);
                  setShowSaveModal(true);
                }}
                className="flex-1 py-2 rounded-xl bg-primary-light text-highlight font-semibold text-sm border-b-4 border-primary-base active:translate-y-1 active:border-b-0 transition-[transform,border-width] duration-75"
              >
                Save Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            {isFullyFilled ? (
              <>
                <h2 className="text-xl font-bold text-ink mb-2">
                  All 4 fields filled! ✓
                </h2>
                <p className="text-muted font-semibold text-lg mb-2">
                  Have you finished reflecting on this situation?
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
                <p className="text-muted mb-2 text-lg">
                  You haven't filled in all 4 fields. Are you sure this is it for now?
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
                No history entries yet. Start tracking your cognitive triangles!
              </p>
            ) : (
              <div className="space-y-3">
                {historyEntries.map((entry) => (
                  <button
                    key={entry._id}
                    onClick={() => handleHistoryEntryClick(entry)}
                    className="w-full bg-primary-light/20 hover:bg-primary-light/30 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-ink">
                          {formatFriendlyDateTime(entry.date)}
                        </div>
                        <div className="text-sm font-medium text-muted mt-1">
                          Situation: {entry.situation.slice(0, 40)}
                          {entry.situation.length > 40 ? "..." : ""}
                        </div>
                      </div>
                      <div>
                        {entry.complete ? (
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
              {/* Situation */}
              <div>
                <div className="font-bold text-ink mb-2">Situation</div>
                {selectedHistoryEntry.situation.trim() !== "" ? (
                  <div className="bg-primary-base/20 px-3 py-2 rounded-lg text-sm text-ink">
                    {selectedHistoryEntry.situation}
                  </div>
                ) : (
                  <p className="text-muted text-sm italic">
                    No situation recorded
                  </p>
                )}
              </div>

              {/* Thoughts */}
              <div>
                <div className="font-bold text-ink mb-2">Thoughts</div>
                {selectedHistoryEntry.thoughts.trim() !== "" ? (
                  <div className="bg-accent-3/20 px-3 py-2 rounded-lg text-sm text-ink">
                    {selectedHistoryEntry.thoughts}
                  </div>
                ) : (
                  <p className="text-muted text-sm italic">
                    No thoughts recorded
                  </p>
                )}
              </div>

              {/* Feelings */}
              <div>
                <div className="font-bold text-ink mb-2">Feelings</div>
                {selectedHistoryEntry.feelings.trim() !== "" ? (
                  <div className="bg-accent-1/20 px-3 py-2 rounded-lg text-sm text-ink">
                    {selectedHistoryEntry.feelings}
                  </div>
                ) : (
                  <p className="text-muted text-sm italic">
                    No feelings recorded
                  </p>
                )}
              </div>

              {/* Behavior */}
              <div>
                <div className="font-bold text-ink mb-2">Behavior</div>
                {selectedHistoryEntry.behavior.trim() !== "" ? (
                  <div className="bg-accent-2/20 px-3 py-2 rounded-lg text-sm text-ink">
                    {selectedHistoryEntry.behavior}
                  </div>
                ) : (
                  <p className="text-muted text-sm italic">
                    No behavior recorded
                  </p>
                )}
              </div>
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

export default Cogtri;