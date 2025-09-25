import { useState } from "react";

const Cogtri = () => {
  // State for main entry modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalField, setModalField] = useState<
    "Thoughts" | "Behavior" | "Feelings" | "Situation" | null
  >(null);

  // State for form entries
  const [entry, setEntry] = useState({
    Situation: "",
    Thoughts: "",
    Feelings: "",
    Behavior: "",
    complete: false,
  });

  // State for confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  // History timeline
  const [history, setHistory] = useState<(typeof entry)[]>([]);

  const handleSaveClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmSave = (isComplete: boolean) => {
    setEntry({ ...entry, complete: isComplete });
    setHistory([{ ...entry, complete: isComplete }, ...history]);
    setEntry({
      Situation: "",
      Thoughts: "",
      Feelings: "",
      Behavior: "",
      complete: false,
    });
    setConfirmOpen(false);
  };

  return (
    <div className="bg-gray-50 p-4">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-10">Cognitive Triangle</h1>

      {/* Triangle */}
      <div className="relative max-w-md mx-auto mb-6">
        <svg viewBox="0 0 300 260" className="w-full h-auto">
          {/* Smaller triangle with balanced ratio */}
          <polygon
            points="150,20 40,240 260,240"
            stroke="black"
            strokeWidth="2"
            fill="transparent"
          />
        </svg>

        {/* Thoughts button (top) */}
        <button
          onClick={() => {
            setModalField("Thoughts");
            setModalOpen(true);
          }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white rounded w-26 py-2 text-center"
        >
          Thoughts
        </button>

        {/* Behavior button (bottom left) */}
        <button
          onClick={() => {
            setModalField("Behavior");
            setModalOpen(true);
          }}
          className="absolute bottom-0 left-0 transform translate-[0.5] translate-y-1/2 bg-green-500 text-white rounded w-26 py-2 text-center"
        >
          Behavior
        </button>

        {/* Feelings button (bottom right) */}
        <button
          onClick={() => {
            setModalField("Feelings");
            setModalOpen(true);
          }}
          className="absolute bottom-0 right-0 transform -translate-x-[0.5] translate-y-1/2 bg-red-500 text-white rounded w-26 py-2 text-center"
        >
          Feelings
        </button>

        {/* Situation (center) */}
        <button
          onClick={() => {
            setModalField("Situation");
            setModalOpen(true);
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white rounded w-26 py-2 text-center"
        >
          Situation
        </button>
      </div>

      {/* Save Entry Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleSaveClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Entry
        </button>
      </div>

      {/* History Timeline */}
      <div className="bg-white p-4 rounded shadow max-w-md mx-auto">
        <h2 className="font-medium mb-2">History Timeline</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No previous entries yet.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((h, i) => (
              <li key={i} className="border-l-2 border-gray-300 pl-3">
                <p>
                  <strong>Situation:</strong> {h.Situation}
                </p>
                <p>
                  <strong>Thoughts:</strong> {h.Thoughts}
                </p>
                <p>
                  <strong>Feelings:</strong> {h.Feelings}
                </p>
                <p>
                  <strong>Behavior:</strong> {h.Behavior}
                </p>
                <p className="text-sm text-gray-500">
                  Complete: {h.complete ? "Yes" : "No"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main Entry Modal */}
      {modalOpen && modalField && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">{modalField}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xl font-bold text-gray-600"
              >
                ×
              </button>
            </div>
            <textarea
              className="w-full border rounded p-2 h-24"
              value={entry[modalField]}
              onChange={(e) =>
                setEntry({ ...entry, [modalField]: e.target.value })
              }
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Complete Modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmOpen(false);
          }}
        >
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Confirm it's complete?</h2>
            <div className="flex justify-between gap-4">
              <button
                onClick={() => handleConfirmSave(true)}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Yes
              </button>
              <button
                onClick={() => handleConfirmSave(false)}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cogtri;
