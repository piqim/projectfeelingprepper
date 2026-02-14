import { useState, useEffect } from "react";

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

const Grapes = () => {
  // API URL
  const API_URL = "http://localhost:5050";

  // State for current entries (one input per category)
  const [entries, setEntries] = useState({
    gentle: "",
    recreation: "",
    accomplishment: "",
    pleasure: "",
    exercise: "",
    social: "",
  });

  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<GrapesEntry | null>(null);
  const [isFullyFilled, setIsFullyFilled] = useState(false);

  // History data from MongoDB
  const [historyEntries, setHistoryEntries] = useState<GrapesEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Get userId from localStorage
  const getUserId = () => {
    return localStorage.getItem("userId");
  };

  useEffect(() => {
    // Fetch history on component mount
    fetchHistory();
  }, []);

  // Fetch user's GRAPES history from MongoDB
  const fetchHistory = async () => {
    const userId = getUserId();
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
        console.log("Fetched GRAPES history:", data);
      } else {
        console.error("Failed to fetch history:", response.status);
        alert("Failed to load history. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      alert("Error loading history. Please check your connection.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handlers
  const handleInputChange = (
    category: keyof typeof entries,
    value: string
  ) => {
    setEntries({ ...entries, [category]: value });
  };

  const handleSaveClick = () => {
    // Check if at least one field is filled
    const hasContent = Object.values(entries).some((val) => val.trim() !== "");
    if (!hasContent) {
      alert("Please fill in at least one activity before saving.");
      return;
    }

    // Check if all 6 fields are filled
    const allFieldsFilled = Object.values(entries).every((val) => val.trim() !== "");
    setIsFullyFilled(allFieldsFilled);

    // Always show modal for confirmation
    setShowSaveModal(true);
  };

  const handleConfirmSave = async (completed: boolean) => {
    const userId = getUserId();
    if (!userId) {
      alert("You must be logged in to save entries.");
      setShowSaveModal(false);
      return;
    }

    // Prepare data for MongoDB
    const dataToSave = {
      userId,
      date: new Date().toISOString(),
      gentle: entries.gentle,
      recreation: entries.recreation,
      accomplishment: entries.accomplishment,
      pleasure: entries.pleasure,
      exercise: entries.exercise,
      social: entries.social,
      completed,
    };

    console.log("Saving to MongoDB:", dataToSave);

    try {
      const response = await fetch(`${API_URL}/grapes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Saved successfully:", result);

        // Clear form after save
        setEntries({
          gentle: "",
          recreation: "",
          accomplishment: "",
          pleasure: "",
          exercise: "",
          social: "",
        });

        // Refresh history to show new entry
        await fetchHistory();

        setShowSaveModal(false);
        alert("Entry saved successfully!");
      } else {
        const error = await response.json();
        console.error("Save failed:", error);
        alert(`Failed to save entry: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving entry. Please check your connection.");
    }
  };

  const handleViewHistory = () => {
    setShowHistoryModal(true);
    // Refresh history when opening modal
    fetchHistory();
  };

  const handleHistoryEntryClick = (entry: GrapesEntry) => {
    setSelectedHistoryEntry(entry);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowSaveModal(false);
      setShowHistoryModal(false);
      setSelectedHistoryEntry(null);
    }
  };

  return (
    <div className=" bg-highlight pb-10">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-dark text-3xl font-bold text-center montserrat-alternates">
          GRAPES (Daily Tracker)
        </h1>
        <div className="w-full h-1 bg-dark mt-2"></div>
      </div>

      {/* Grape Vine Container */}
      <div className="relative px-2 mt-2 rounded-2xl bg-neutral" style={{ minHeight: "700px" }}>
        {/* SVG Tree Structure */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 700"
          style={{ zIndex: 0 }}
        >
          {/* Tree trunk/branches */}
          <path
            d="M 240 650 Q 50 550, 180 450 Q 150 390, 120 280 Q 100 280, 120 100"
            stroke="#0281A7"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 80 470 Q 200 300, 240 340 Q 270 310, 300 300"
            stroke="#0281A7"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 160 280 Q 20 300, 350 90 Q 300 310"
            stroke="#0281A7"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 240 350 Q 260 300, 280 250"
            stroke="#0281A7"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 140 450 Q 50 400, 290 500"
            stroke="#0281A7"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Leaves */}
          <ellipse cx="200" cy="620" rx="50" ry="35" fill="#A7CC81" opacity="0.7" />
          <ellipse cx="240" cy="640" rx="45" ry="32" fill="#A7CC81" opacity="0.8" />
          <ellipse cx="210" cy="660" rx="40" ry="28" fill="#A7CC81" opacity="0.9" />
        </svg>

        {/* Grape Circles with Inputs */}
        {/* G - Gentle (Top Left) */}
        <div
          className="absolute bg-secondary rounded-full flex flex-col items-center justify-baseline p-4"
          style={{
            width: "170px",
            height: "170px",
            left: "9%",
            top: "1%",
            zIndex: 10,
          }}
        >
          <div className="text-4xl font-bold text-dark mb-1">G</div>
          <div className="text-sm text-dark font-bold text-center mb-3">
            Gentle-to-Self
          </div>
          <input
            type="text"
            value={entries.gentle}
            onChange={(e) => handleInputChange("gentle", e.target.value)}
            placeholder="ie. comforted me"
            className="w-full text-xs font-semibold px-3 py-2 rounded-full border-none bg-white text-center shadow-sm"
          />
        </div>

        {/* R - Recreation (Top Right) */}
        <div
          className="absolute bg-secondary rounded-full flex flex-col items-center justify-baseline p-4"
          style={{
            width: "170px",
            height: "170px",
            right: "10%",
            top: "7.5%",
            zIndex: 10,
          }}
        >
          <div className="text-4xl font-bold text-dark mb-1">R</div>
          <div className="text-sm text-dark font-bold text-center mb-3">
            Recreation
          </div>
          <input
            type="text"
            value={entries.recreation}
            onChange={(e) => handleInputChange("recreation", e.target.value)}
            placeholder="ie. played a game"
            className="w-full text-xs font-semibold px-3 py-2 rounded-full border-none bg-white text-center shadow-sm"
          />
        </div>

        {/* A - Accomplishment (Middle Left) */}
        <div
          className="absolute bg-secondary rounded-full flex flex-col items-center justify-baseline p-4"
          style={{
            width: "170px",
            height: "170px",
            left: "7.5%",
            top: "27.5%",
            zIndex: 10,
          }}
        >
          <div className="text-4xl font-bold text-dark mb-1">A</div>
          <div className="text-sm text-dark font-bold text-center mb-3">
            Accomplishment
          </div>
          <input
            type="text"
            value={entries.accomplishment}
            onChange={(e) =>
              handleInputChange("accomplishment", e.target.value)
            }
            placeholder="ie. won a game"
            className="w-full text-xs font-semibold px-3 py-2 rounded-full border-none bg-white text-center shadow-sm"
          />
        </div>

        {/* P - Pleasure (Middle Right) */}
        <div
          className="absolute bg-secondary rounded-full flex flex-col items-center justify-baseline p-4"
          style={{
            width: "170px",
            height: "170px",
            right: "5%",
            top: "32.5%",
            zIndex: 10,
          }}
        >
          <div className="text-4xl font-bold text-dark mb-1">P</div>
          <div className="text-sm text-dark font-bold text-center mb-3">
            Pleasure
          </div>
          <input
            type="text"
            value={entries.pleasure}
            onChange={(e) => handleInputChange("pleasure", e.target.value)}
            placeholder="ie. ate a burger"
            className="w-full text-xs font-semibold px-3 py-2 rounded-full border-none bg-white text-center shadow-sm"
          />
        </div>

        {/* E - Exercise (Bottom Left) */}
        <div
          className="absolute bg-secondary rounded-full flex flex-col items-center justify-baseline p-4"
          style={{
            width: "170px",
            height: "170px",
            left: "15%",
            top: "52.5%",
            zIndex: 10,
          }}
        >
          <div className="text-4xl font-bold text-dark mb-1">E</div>
          <div className="text-sm text-dark font-bold text-center mb-3">
            Exercise
          </div>
          <input
            type="text"
            value={entries.exercise}
            onChange={(e) => handleInputChange("exercise", e.target.value)}
            placeholder="ie. benched 220 lbs"
            className="w-full text-xs font-semibold px-3 py-2 rounded-full border-none bg-white text-center shadow-sm"
          />
        </div>

        {/* S - Social (Bottom Right) */}
        <div
          className="absolute bg-secondary rounded-full flex flex-col items-center justify-baseline p-4"
          style={{
            width: "170px",
            height: "170px",
            right: "2.5%",
            top: "60%",
            zIndex: 10,
          }}
        >
          <div className="text-4xl font-bold text-dark mb-1">S</div>
          <div className="text-sm text-dark font-bold text-center mb-3">
            Social
          </div>
          <input
            type="text"
            value={entries.social}
            onChange={(e) => handleInputChange("social", e.target.value)}
            placeholder="ie. hung out w/ fam"
            className="w-full text-xs font-semibold px-3 py-2 rounded-full border-none bg-white text-center shadow-sm"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mt-8 flex gap-4">
        <button
          onClick={handleSaveClick}
          className="flex-1 bg-primary-light text-xl text-highlight font-bold py-4 rounded-2xl shadow-lg hover:bg-primary-base transition-all duration-200"
        >
          Save Entry
        </button>
        <button
          onClick={handleViewHistory}
          className="flex-1 bg-primary-light text-xl text-highlight font-bold py-4 rounded-2xl shadow-lg hover:bg-primary-base transition-all duration-200"
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
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl">
            {isFullyFilled ? (
              <>
                <h2 className="text-2xl font-bold text-dark mb-2">
                  All 6 activities filled! ✓
                </h2>
                <p className="text-gray-600 font-semibold text-lg">
                  Have you completed all of the activities?
                </p>
                <p className="text-red-600 mb-6 text-xs font-medium">
                  ⚠️ Warning: Entries cannot be modified after submission.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                    }}
                    className="flex-1 bg-red-400 text-highlight text-2xl font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Nope
                  </button>
                  <button
                    onClick={() => handleConfirmSave(true)}
                    className="flex-1 bg-accent-3 text-highlight text-2xl font-bold py-3 rounded-lg hover:bg-accent-3/90 transition-colors"
                  >
                    Done ✓
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-dark mb-2">
                  Confirm Partial Entry?
                </h2>
                <p className="text-gray-600  mb-2 text-lg font-semibold">
                  You haven't filled in all 6 GRAPES activities. Are you sure you want to save this as finished for today?
                </p>
                <p className="text-red-600 mb-6 text-xs font-medium">
                  ⚠️ Warning: Entries cannot be modified after submission.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 bg-red-400 text-highlight text-2xl font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Nope
                  </button>
                  <button
                    onClick={() => handleConfirmSave(false)}
                    className="flex-1 bg-yellow-500 text-highlight text-2xl font-bold py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Save Partial
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark">Entry History</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
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
                <p className="text-gray-500">Loading history...</p>
              </div>
            ) : historyEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
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
                        <div className="font-bold text-dark">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-md font-medium text-dark">
                          {new Date(entry.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </div>
                        <div className="text-sm font-medium text-gray-600 mt-1">
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
                          <span className="bg-gray-300 text-gray-700 text-sm px-2 py-1 rounded-full">
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark">
                {new Date(selectedHistoryEntry.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </h2>
              <button
                onClick={() => setSelectedHistoryEntry(null)}
                className="text-gray-500 hover:text-gray-700"
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
                    <div className="font-bold text-dark mb-2">
                      {label}
                    </div>
                    {activity && activity.trim() !== "" ? (
                      <div className={`${color}/20 px-3 py-2 rounded-lg text-sm`}>
                        {activity}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic">
                        No activity recorded
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t">
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