import { useState } from "react";

const Grapes = () => {
  // State for each GRAPES entry
  const [entries, setEntries] = useState({
    gentle: "",
    recreation: "",
    accomplishment: "",
    pleasure: "",
    exercise: "",
    social: "",
  });

  // Calendar modal state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Placeholder calendar entries
  const placeholderEntries: Record<number, string[]> = {
    3: [
      "Gentle: Took a nap",
      "Recreation: Played guitar 🎸",
      "Accomplishment: Finished homework on algebra and helped a classmate",
    ],
    5: ["Exercise: Yoga", "Pleasure: Ate favorite snack 🍫"],
  };

  // Handlers
  const handleInputChange = (key: keyof typeof entries, value: string) => {
    setEntries({ ...entries, [key]: value });
  };

  const handleSave = () => {
    console.log("Saving entries:", { entries });
    // TODO: Send to backend
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const toggleExpand = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">GRAPES (Daily Tracker)</h1>
      </div>

      {/* GRAPES Form */}
      <div className="space-y-4 bg-white p-4 rounded-lg shadow">
        {([
          { key: "gentle", label: "G: Gentle to Self" },
          { key: "recreation", label: "R: Recreation" },
          { key: "accomplishment", label: "A: Accomplishment" },
          { key: "pleasure", label: "P: Pleasure" },
          { key: "exercise", label: "E: Exercise" },
          { key: "social", label: "S: Social" },
        ] as const).map(({ key, label }) => (
          <div key={key} className="flex flex-col">
            <label className="mb-1 font-medium">{label}</label>
            <input
              type="text"
              value={entries[key]}
              onChange={(e) => handleInputChange(key, e.target.value)}
              placeholder={`Enter your ${label} activity`}
              className="border px-2 py-1 rounded w-full"
            />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Save Entry
        </button>
      </div>

      {/* Calendar */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="font-medium mb-3">Calendar View</h2>
        <div className="grid grid-cols-7 text-center text-sm font-medium">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>
        <div className="grid grid-cols-7 text-center mt-2 gap-y-2">
          {[...Array(28)].map((_, i) => {
            const day = i + 1;
            const hasEntry = placeholderEntries[day];
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`p-1 rounded ${
                  hasEntry
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          (• = completed, o = partial)
        </p>
      </div>

      {/* Modal */}
      {isModalOpen && selectedDay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleOverlayClick}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Entries for Day {selectedDay}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xl font-bold text-gray-600"
              >
                ×
              </button>
            </div>

            {placeholderEntries[selectedDay] ? (
              <ul className="space-y-3">
                {placeholderEntries[selectedDay].map((entry, index) => {
                  const isLong = entry.length > 25;
                  const isExpanded = expanded[index] || false;
                  return (
                    <li
                      key={index}
                      className="flex items-start justify-between bg-gray-100 px-3 py-2 rounded"
                    >
                      <span className="flex-1">
                        {isLong && !isExpanded
                          ? entry.slice(0, 25) + "..."
                          : entry}
                      </span>
                      {isLong && (
                        <button
                          onClick={() => toggleExpand(index)}
                          className="ml-2 text-blue-500 text-sm"
                        >
                          {isExpanded ? "Collapse" : "Expand"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500">No entries for this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Grapes;
