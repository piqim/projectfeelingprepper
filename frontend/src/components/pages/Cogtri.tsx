import { useState } from "react";

interface CogTriEntry {
  _id?: string;
  date: string;
  situation: string;
  thoughts: string;
  feelings: string;
  behavior: string;
  complete: boolean;
}

const Cogtri = () => {
  // State for current entry
  const [entry, setEntry] = useState({
    situation: "",
    thoughts: "",
    feelings: "",
    behavior: "",
  });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalField, setModalField] = useState<
    "thoughts" | "feelings" | "behavior" | "situation" | null
  >(null);
  const [tempValue, setTempValue] = useState("");

  // Confirmation and History modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] =
    useState<CogTriEntry | null>(null);

  // Instructions toggle
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  
  // About toggle
  const [aboutOpen, setAboutOpen] = useState(false);

  // Placeholder history data (will be fetched from MongoDB)
  const [historyEntries] = useState<CogTriEntry[]>([
    {
      _id: "1",
      date: "2025-02-10",
      situation: "Failed an exam",
      thoughts: "I never do well in this class, why even try?",
      feelings: "Shame, hopelessness",
      behavior: "Not trying on/studying for future exams",
      complete: true,
    },
    {
      _id: "2",
      date: "2025-02-09",
      situation: "Had a disagreement with a friend",
      thoughts: "They don't understand me at all",
      feelings: "Frustrated, lonely",
      behavior: "Avoided them for the rest of the day",
      complete: true,
    },
  ]);

  // Field labels for display
  const fieldLabels = {
    thoughts: "Thoughts",
    feelings: "Feelings",
    behavior: "Behavior",
    situation: "Situation",
  };

  // Handlers
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

  const handleSaveClick = () => {
    // Check if at least one field is filled
    const hasContent = Object.values(entry).some((val) => val.trim() !== "");
    if (!hasContent) {
      alert("Please fill in at least one field before saving.");
      return;
    }
    setShowSaveModal(true);
  };

  const handleConfirmSave = async (complete: boolean) => {
    // Prepare data for MongoDB
    const dataToSave: Omit<CogTriEntry, "_id"> = {
      date: new Date().toISOString().split("T")[0],
      situation: entry.situation,
      thoughts: entry.thoughts,
      feelings: entry.feelings,
      behavior: entry.behavior,
      complete,
    };

    console.log("Saving to MongoDB:", dataToSave);

    // TODO: API call to save to MongoDB
    // try {
    //   const response = await fetch('/api/cogtri', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(dataToSave),
    //   });
    //   const result = await response.json();
    //   console.log('Saved:', result);
    // } catch (error) {
    //   console.error('Error saving:', error);
    // }

    // Clear form after save
    setEntry({
      situation: "",
      thoughts: "",
      feelings: "",
      behavior: "",
    });
    setShowSaveModal(false);
    alert("Entry saved successfully!");
  };

  const handleNotYet = () => {
    setShowSaveModal(false);
  };

  const handleViewHistory = () => {
    setShowHistoryModal(true);
    // TODO: Fetch history from MongoDB
    // fetch('/api/cogtri/history')
    //   .then(res => res.json())
    //   .then(data => setHistoryEntries(data));
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
    <div className="min-h-[930px] bg-primary-base flex flex-col">
      {/* CogTri Section */}
      <div className="px-4 pt-4 pb-10">
        <h1 className="text-highlight text-3xl font-bold mb-4 mx-6">CogTri🔺</h1>

        {/* Triangle Container */}
        <div className="relative w-full max-w-md mx-auto" style={{ aspectRatio: "1.5" }}>
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
            className="absolute bg-accent-3 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold text-dark shadow-lg hover:opacity-80 transition-opacity"
            style={{
              left: "50%",
              top: "0%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            T
          </button>

          {/* B - Behavior (Bottom Left) */}
          <button
            onClick={() => handleOpenModal("behavior")}
            className="absolute bg-accent-2 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold text-dark shadow-lg hover:opacity-80 transition-opacity"
            style={{
              left: "15%",
              top: "65%",
              zIndex: 10,
            }}
          >
            B
          </button>

          {/* F - Feelings (Bottom Right) */}
          <button
            onClick={() => handleOpenModal("feelings")}
            className="absolute bg-accent-1 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold text-dark shadow-lg hover:opacity-80 transition-opacity"
            style={{
              right: "15%",
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
            className="flex-1 bg-primary-light text-highlight text-xl font-bold py-4 rounded-2xl shadow-lg hover:opacity-80 transition-opacity"
          >
            Save Entry
          </button>
          <button
            onClick={handleViewHistory}
            className="flex-1 bg-primary-light text-highlight text-xl font-bold py-4 rounded-2xl shadow-lg hover:opacity-80 transition-opacity"
          >
            See History
          </button>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="px-6 py-4 bg-highlight">
        {/* Clickable Header */}
        <button
          onClick={() => setInstructionsOpen(!instructionsOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-dark text-2xl font-bold">Instructions</h2>
          <svg
            className={`w-6 h-6 text-dark transition-transform duration-300 ${
              instructionsOpen ? "rotate-180" : ""
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
          className={`overflow-hidden transition-all duration-300 ${
            instructionsOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex gap-6">
            {/* Left side - Text */}
            <div className="flex-1 font-semibold text-sm">
              <ol className="space-y-3 text-dark">
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
              <img src="/src/assets/instructions.jpg" alt="Instructions Illustration" className="max-w-full max-h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-6 py-4 bg-primary-base">
        {/* Clickable Header */}
        <button
          onClick={() => setAboutOpen(!aboutOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-highlight text-2xl font-bold">About</h2>
          <svg
            className={`w-6 h-6 text-highlight transition-transform duration-300 ${
              aboutOpen ? "rotate-180" : ""
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
          className={`overflow-hidden transition-all duration-300 ${
            aboutOpen ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          {/* Main explanation box */}
          <div className="bg-white rounded-xl rounded-b-none pt-4">
            <p className="text-dark font-bold text-md mb-4 px-4">
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
                <div className="bg-neutral/90 rounded-lg p-2 flex items-center gap-2">
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
                <div className="bg-neutral/90 rounded-lg p-2 flex items-center gap-2">
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark">
                {fieldLabels[modalField]}
              </h2>
              <button
                onClick={handleCancelField}
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

            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={`Enter your ${modalField}...`}
              className="w-full border-2 border-gray-300 rounded-lg p-3 h-32 resize-none focus:border-primary-light focus:outline-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCancelField}
                className="flex-1 text-lg bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveField}
                className="flex-1 text-lg bg-primary-light text-highlight font-semibold py-3 rounded-lg hover:bg-primary-base transition-colors"
              >
                Save
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
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold text-dark mb-4">
              Are you done with your entry?
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Mark this entry as complete if you've finished filling in all
              fields.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleNotYet}
                className="flex-1 text-lg bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Not Yet
              </button>
              <button
                onClick={() => handleConfirmSave(true)}
                className="flex-1 text-lg bg-accent-3 text-white font-semibold py-3 rounded-lg hover:bg-accent-3/90 transition-colors"
              >
                Complete ✓
              </button>
            </div>
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

            {historyEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
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
                        <div className="font-bold text-dark">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
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
                    month: "long",
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
              {/* Situation */}
              <div>
                <div className="font-bold text-dark mb-2">Situation</div>
                {selectedHistoryEntry.situation.trim() !== "" ? (
                  <div className="bg-primary-base/20 px-3 py-2 rounded-lg text-sm">
                    {selectedHistoryEntry.situation}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    No situation recorded
                  </p>
                )}
              </div>

              {/* Thoughts */}
              <div>
                <div className="font-bold text-dark mb-2">Thoughts</div>
                {selectedHistoryEntry.thoughts.trim() !== "" ? (
                  <div className="bg-accent-3/20 px-3 py-2 rounded-lg text-sm">
                    {selectedHistoryEntry.thoughts}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    No thoughts recorded
                  </p>
                )}
              </div>

              {/* Feelings */}
              <div>
                <div className="font-bold text-dark mb-2">Feelings</div>
                {selectedHistoryEntry.feelings.trim() !== "" ? (
                  <div className="bg-accent-1/20 px-3 py-2 rounded-lg text-sm">
                    {selectedHistoryEntry.feelings}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    No feelings recorded
                  </p>
                )}
              </div>

              {/* Behavior */}
              <div>
                <div className="font-bold text-dark mb-2">Behavior</div>
                {selectedHistoryEntry.behavior.trim() !== "" ? (
                  <div className="bg-accent-2/20 px-3 py-2 rounded-lg text-sm">
                    {selectedHistoryEntry.behavior}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    No behavior recorded
                  </p>
                )}
              </div>
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

export default Cogtri;