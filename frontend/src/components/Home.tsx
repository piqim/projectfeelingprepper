import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-neutral p-4 flex flex-col gap-4">
        {/* Welcome Message */}
        <div className="montserrat-alternates mb-2">
          <h2 className="text-dark text-3xl font-medium tracking-wider">
            Welcome Back, Piqim!
          </h2>
        </div>

        {/* PET SECTION */}
        <div className="border-4 border-dark rounded-2xl overflow-hidden flex h-48">
          {/* Left side (scene with fish) */}
          <div className="relative flex-1 bg-primary-light/20 flex items-end justify-center pb-4">
            {/* Sun */}
            <div className="absolute top-4 left-4 w-12 h-12 bg-accent-1 rounded-full"></div>
            
            {/* Ground/Grass */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-accent-3 rounded-bl-xl"></div>
            
            {/* Fish Character */}
            <div className="relative z-10">
              <svg
                viewBox="0 0 120 100"
                className="w-32 h-32"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Fish body */}
                <ellipse
                  cx="55"
                  cy="35"
                  rx="35"
                  ry="25"
                  fill="#FF7F50"
                  stroke="#222089"
                  strokeWidth="3"
                />
                {/* Fish tail */}
                <path
                  d="M 85 35 Q 100 25, 95 35 Q 100 45, 85 35"
                  fill="#FF7F50"
                  stroke="#222089"
                  strokeWidth="3"
                />
                {/* Eye outer */}
                <circle
                  cx="45"
                  cy="30"
                  r="8"
                  fill="white"
                  stroke="#222089"
                  strokeWidth="2"
                />
                {/* Eye inner */}
                <circle cx="45" cy="30" r="4" fill="#222089" />
                {/* Gills */}
                <path
                  d="M 65 30 Q 70 35, 65 40"
                  stroke="#222089"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M 70 32 Q 75 37, 70 42"
                  stroke="#222089"
                  strokeWidth="2"
                  fill="none"
                />

              </svg>
            </div>
          </div>

          {/* Right side (Pet Stats) */}
          <div className="bg-accent-2 flex flex-col items-center justify-start py-4 px-4 w-2/5">
            <h2 className="text-xl font-bold text-dark mb-3">Pet Stats</h2>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-dark">Status:</span>
              <span className="text-sm font-bold text-accent-3">Happy</span>
            </div>
            
            {/* Message */}
            <p className="text-xs font-semibold text-center text-dark/80 leading-relaxed">
              Your pet is feeling great! Keep up the good work :)
            </p>
          </div>
        </div>

        {/* TODAY'S GRAPES CARD */}
        <div className="bg-secondary rounded-2xl px-5 py-5 flex items-center">
          {/* Left Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="montserrat-alternates text-highlight text-2xl font-normal">
                Last GRAPES
              </h3>
              {/* Info Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="white"
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="0.5" fill="white" />
              </svg>
            </div>

            {/* Counter */}
            <div className="flex items-baseline">
              <span className="text-4xl font-semibold text-dark underline decoration-2 underline-offset-4">
                4
              </span>
              <span className="text-3xl font-normal text-highlight ml-2">/ 6</span>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-[2px] h-24 bg-highlight/40 mx-4"></div>

          {/* Right Section */}
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/grapes"
              className="text-highlight text-sm font-semibold whitespace-nowrap"
            >
              Go to GRAPES
            </Link>

            {/* Grape Icon */}
            <Link to="/grapes">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                fill="white"
                className="w-16 h-16"
              >
                <circle cx="32" cy="18" r="5" />
                <circle cx="23" cy="24" r="5" />
                <circle cx="41" cy="24" r="5" />
                <circle cx="32" cy="30" r="5" />
                <circle cx="23" cy="36" r="5" />
                <circle cx="41" cy="36" r="5" />
                <circle cx="32" cy="42" r="5" />
                <path d="M30 8c0-3 4-6 8-4-2 2-4 3-4 6z" fill="white" />
              </svg>
            </Link>
          </div>
        </div>

        {/* LAST COG TRI CARD */}
        <div className="bg-primary-light rounded-2xl px-5 py-5 flex items-center">
          {/* Left Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="montserrat-alternates text-highlight text-2xl font-normal">Last CogTri</h3>
              {/* Info Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="white"
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="0.5" fill="white" />
              </svg>
            </div>

            {/* Status */}
            <div className="flex items-baseline">
              <span className="text-xl font-normal text-dark border-b-2 border-dark pb-1">
                Anxious at work
              </span>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-[2px] h-24 bg-highlight/40 mx-4"></div>

          {/* Right Section */}
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/cogtri"
              className="text-highlight text-sm font-semibold whitespace-nowrap"
            >
              Go to CogTri
            </Link>

            {/* Triangle Icon */}
            <Link to="/cogtri">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                fill="white"
                className="w-16 h-16"
              >
                <polygon points="32,15 8,52 56,52" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Calendar and Streak Section */}
        <div className="flex gap-0 relative h-72">
          {/* Streak */}
          <div className="bg-accent-2 px-5 py-4 rounded-l-2xl w-[35%] relative z-10">
            <div className="font-bold text-xl text-accent-1 leading-tight mb-2">
              You're on a roll!
            </div>
            {/* Divider Line */}
            <div className="w-[85%] h-[2px] my-3 bg-accent-1"></div>
            {/* Number of Days */}
            <div className="flex items-baseline gap-1 text-accent-1 mb-2">
              <p className="font-extrabold text-6xl leading-none">12</p>
              <p className="font-semibold text-xl">days</p>
            </div>
            {/* Fire Emoji */}
            <div className="mt-4">
              <span className="text-7xl">🔥</span>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-highlight rounded-r-2xl flex-1 -ml-4 pl-6 relative shadow-sm">
            <h2 className="text-lg px-2 py-3 text-highlight bg-primary-light rounded-tr-2xl font-semibold mb-3 -ml-6 pl-8">
              October
            </h2>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2 px-2">
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold px-2">
              {/* Empty cells for days before month starts */}
              {[1, 2, 3, 4].map((day) => (
                <div key={`empty-${day}`} className="p-2"></div>
              ))}
              {/* October days (starts on Friday in the PDF) */}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                // Days 1-25 and 31 are highlighted in teal in the PDF
                const isHighlighted = day <= 25 || day === 31;
                return (
                  <div
                    key={day}
                    className={`p-2 rounded ${
                      isHighlighted
                        ? "bg-primary-light text-highlight"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
    
    </div>
  );
};

export default Home;