import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-neutral p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="montserrat-alternates flex flex-col justify-center items-start">
        <h1 className="text-3xl text-dark tracking-wider sm:tracking-widest font-medium">
          Welcome Back,
        </h1>
        <h1 className="text-3xl text-dark tracking-wider sm:tracking-widest font-medium">
          Senny!
        </h1>
      </div>

      {/* PET SECTION */}
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="flex min-h-56 w-full border-4 border-dark rounded-xl">
          {/* Left side (scene) */}
          <div className="relative flex-1 rounded-l-xl bg-highlight w-[60%]"></div>

          {/* Right side (Pet Stats) */}
          <div className="bg-accent-2 flex justify-center items-start rounded-r-xl py-2 w-[40%]">
            <h2 className="text-lg font-semibold text-dark">Pet Stats</h2>
          </div>
        </div>
      </div>

      {/* CARDS SECTION */}
      <div className="flex flex-col gap-4">
        {/* LAST GRAPES CARD */}
        <div className="bg-secondary rounded-xl px-4 py-4 flex justify-around">
          {/* Left Section */}
          <div className="flex flex-col min-w-[60%]">
            <div className="flex items-center justify-between space-x-2">
              <p className="montserrat-alternates text-highlight text-2xl font-light">
                Last GRAPES
              </p>
              {/* Info Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="white"
                className="w-5 h-5 opacity-100"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="1" />
              </svg>
            </div>

            {/* Counter */}
            <div className="flex items-baseline my-4">
              <span className="text-2xl font-medium text-dark ml-2 underline">
                4
              </span>
              <span className="text-2xl font-semibold text-highlight ml-2">
                / 6
              </span>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-[2px] h-24 bg-highlight opacity-100"></div>

          {/* Right Section */}
          <div className="flex flex-col items-center">
            <Link to="/grapes" className="text-highlight text-sm font-semibold">
              Go to GRAPES
            </Link>

            {/* Grape Icon */}
            <Link to="/grapes">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                fill="white"
                className="w-20 h-20"
              >
                <circle cx="32" cy="20" r="6" />
                <circle cx="22" cy="26" r="6" />
                <circle cx="42" cy="26" r="6" />
                <circle cx="32" cy="32" r="6" />
                <circle cx="22" cy="38" r="6" />
                <circle cx="42" cy="38" r="6" />
                <circle cx="32" cy="44" r="6" />
                <path d="M30 10c0-3 4-6 8-4-2 2-4 3-4 6z" fill="white" />
              </svg>
            </Link>
          </div>
        </div>
        {/* LAST Cog Tri CARD */}
        <div className="bg-primary-light rounded-xl px-4 py-4 flex justify-around">
          {/* Left Section */}
          <div className="flex flex-col min-w-[60%]">
            <div className="flex items-center justify-between space-x-2">
              <p className="montserrat-alternates text-highlight text-2xl font-light">
                Last Cog Tri
              </p>
              {/* Info Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="white"
                className="w-5 h-5 opacity-100"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="1" />
              </svg>
            </div>

            {/* Status */}
            <div className="flex items-baseline my-4">
              <span className="text-2xl font-light text-dark border-b-3">
                Anxious at work
              </span>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-[2px] h-24 bg-highlight opacity-100"></div>

          {/* Right Section */}
          <div className="flex flex-col items-center">
            <Link to="/cogtri" className="text-highlight text-sm font-semibold">
              Go to Cog Tri
            </Link>

            {/* Triangle Icon */}
            <Link to="/cogtri">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                fill="white"
                className="w-20 h-20"
              >
                <polygon points="30,10 5,50 55,50" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Calendar and Streak Section */}
      <div className="flex flex-row items-center">
        {/* Streak */}
        <div className="bg-accent-2 px-4 py-2 text-sm text-gray-600 min-w-[40%] min-h-72 rounded-l-xl">
          <div className="font-bold text-lg text-accent-1">You're on a <br></br> roll!</div>
          {/* Divider Line */}
          <div className="w-[85%] h-[2px] my-2 bg-accent-1 opacity-100"></div>
          {/* Number of Days */}
          <div className="flex flex-row items-center text-accent-1">
            <p className="font-extrabold text-6xl">12</p>
            <p className="font-semibold text-xl">days</p>
          </div>
          {/* Fire Emoticon */}
          <div className=" -translate-x-2 translate-y-5 select-none">
            <p className="text-8xl">🔥</p>
          </div>

          
        </div>
        {/* Calendar */}
        <div className="bg-highlight rounded-xl min-h-72 min-w-[65%] -translate-x-5 select-none">
          <h2 className="text-lg px-4 py-1 text-highlight bg-primary-base rounded-t-xl font-medium mb-2">
            November
          </h2>
          {/* Placeholder: You’ll later connect a calendar lib or custom component */}
          <div className="grid grid-cols-7 px-4 gap-2 text-gray-500 text-center text-sm font-semibold">
            <p>Su</p>
            <p>M</p>
            <p>Tu</p>
            <p>W</p>
            <p>Th</p>
            <p>F</p>
            <p>Sa</p>
          </div>
          <div className="grid px-4 py-2 grid-cols-7 gap-2 text-center font-bold text-sm">
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className={`p-2 rounded-sm ${
                  i % 5 === 0
                    ? "bg-primary-base text-highlight"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
