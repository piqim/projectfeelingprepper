import { Link } from "react-router-dom";

const Learnmore = () => {
  return (
    <div className="max-h-screen bg-gray-50 p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-center items-center bg-green-200 shadow rounded-xl">
        <h1 className="text-xl font-semibold py-3">Learn More 🤔</h1>
      </div>

      {/* Info Cards */}
      <div className="flex flex-col gap-3">
        {/* GRAPES */}
        <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
          <div>
            <p className="text-base font-semibold">GRAPES</p>
            <p className="text-sm text-gray-600">
              Daily self-care activities to stay balanced.
            </p>
            <a
              href="https://www.therapistaid.com/worksheets/grapes-self-care"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm font-semibold hover:underline"
            >
              Source →
            </a>
          </div>
        </div>

        {/* Cognitive Triangle */}
        <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
          <div>
            <p className="text-base font-semibold">Cognitive Triangle</p>
            <p className="text-sm text-gray-600">
              Explore links between thoughts, feelings, and behavior.
            </p>
            <a
              href="https://www.therapistaid.com/therapy-worksheet/cognitive-triangle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm font-semibold hover:underline"
            >
              Source →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learnmore;
