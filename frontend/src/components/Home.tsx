import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="max-h-screen bg-gray-50 p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-center items-center bg-blue-200 rounded-xl">
        <h1 className="text-2xl font-semibold py-4">Welcome back, Piqim 👋</h1>
      </div>

      {/* Cards Section */}
      <div className="flex flex-col gap-1">

        <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Today’s GRAPES</p>
            <p className="font-medium">4 / 6</p>
          </div>
          <Link
            to="/grapes"
            className="text-blue-500 text-sm font-semibold hover:underline"
          >
            Go to GRAPES →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Last Cog Tri</p>
            <p className="font-medium">Anxious at work</p>
          </div>
          <Link
            to="/cogtri"
            className="text-blue-500 text-sm font-semibold hover:underline"
          >
            Go to CogTri →
          </Link>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Calendar</h2>
        <p className="text-sm text-gray-500 mb-4">
          Highlights days with entries + streak count
        </p>

        {/* Placeholder: You’ll later connect a calendar lib or custom component */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className={`p-2 rounded ${
                i % 5 === 0
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Streak */}
        <div className="mt-4 text-sm text-gray-600">
          🔥 Streak: <span className="font-semibold">7 days</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
