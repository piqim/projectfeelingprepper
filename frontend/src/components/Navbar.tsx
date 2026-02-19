import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import config from "../config";

interface User {
  _id: string;
  username: string;
  email: string;
  streak: number;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  // API base URL from config
  const API_URL = config.API_URL;

  // Check if current page is login or register
  const isAuthPage = location.pathname === "/user/login" || location.pathname === "/user/register";

  useEffect(() => {
    if (isAuthPage) {
      return;
    }

    fetchCurrentUser();
  }, [isAuthPage, location.pathname]);

  // Fetch current user data
  const fetchCurrentUser = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      // User not logged in
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = () => {
    setIsOpen(false);

    // Clear auth/session state
    localStorage.removeItem("userId");
    setUser(null);
    console.log("Logout clicked");

    // Navigate to login page
    navigate("/user/login");
  };

  // Get user's initial (first letter of username)
  const getUserInitial = () => {
    if (!user || !user.username) return "?";
    return user.username.charAt(0).toUpperCase();
  };

  // Hide navbar entirely on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed w-full h-14 bg-dark shadow-md px-4 py-3 flex items-center justify-between z-50">
        {/* Burger + Logo */}
        <div className="flex items-center gap-3">
          {/* Burger button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col justify-center items-center w-8 h-8 z-50"
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-6 bg-highlight rounded transition-all duration-300 ${isOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
            />
            <span
              className={`h-0.5 w-6 bg-highlight rounded my-1 transition-all duration-300 ${isOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`h-0.5 w-6 bg-highlight rounded transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
            />
          </button>

          {/* Logo / Title */}
          <div className="text-xl font-bold montserrat-alternates">
            <Link
              to="/"
              className="hover:text-accent-2 text-highlight transition-colors duration-200"
            >
              FeelingPrepper
            </Link>
          </div>
        </div>
      </nav>

      <nav className="h-14" /> {/* Spacer to prevent content being hidden behind fixed navbar */}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar / Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-neutral z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header with Close button */}
        <div className="bg-dark px-6 py-4 flex items-center justify-between">
          <h2 className="text-highlight text-xl font-bold montserrat-alternates">
            Menu
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-highlight hover:text-accent-2 transition-colors duration-200"
            aria-label="Close menu"
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

        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          {/* Profile section */}
          <div className="bg-primary-light/10 px-6 py-6 border-b-2 border-primary-light/20">
            <div className="flex items-center gap-4">
              {/* Profile Avatar with Initial */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary-base to-primary-light rounded-full flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-highlight">
                  {getUserInitial()}
                </span>
              </div>
              <div>
                <p className="font-bold text-lg text-dark">
                  {user?.username || "Guest"}
                </p>
                <p className="text-sm text-gray-600">
                  {user ? "User Profile" : "Not logged in"}
                </p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex-1 px-6 py-6 flex flex-col gap-2">
            {/* Home Link */}
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-light/10 text-dark font-semibold transition-all duration-200 hover:translate-x-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </Link>

            {/* Techniques Section */}
            <div className="mt-2">
              <p className="px-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                Techniques
              </p>
              <div className="flex flex-col gap-1 mt-1">
                <Link
                  to="/grapes"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 ml-4 rounded-lg hover:bg-secondary/20 text-dark font-medium transition-all duration-200 hover:translate-x-1"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="8" r="2" />
                    <circle cx="8" cy="12" r="2" />
                    <circle cx="16" cy="12" r="2" />
                    <circle cx="12" cy="16" r="2" />
                  </svg>
                  GRAPES
                </Link>
                <Link
                  to="/cogtri"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 ml-4 rounded-lg hover:bg-primary-light/20 text-dark font-medium transition-all duration-200 hover:translate-x-1"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="12,2 2,20 22,20" />
                  </svg>
                  Cog Tri
                </Link>
              </div>
            </div>

            {/* Learn More Link */}
            <Link
              to="/learnmore"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg hover:bg-accent-3/20 text-dark font-semibold transition-all duration-200 hover:translate-x-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Learn More
            </Link>

            {/* Settings Link */}
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent-2/20 text-dark font-semibold transition-all duration-200 hover:translate-x-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </Link>

            {/* Divider */}
            <div className="border-t-2 border-gray-300 my-4"></div>

            {/* Development Links (can remove later => set to hidden for now) */}
            <div className="hidden">
              <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Dev Links
            </p>
            <Link
              to="/dev"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-600 text-sm font-medium transition-all duration-200"
            >
              Dev Panel*
            </Link>
            <Link
              to="/user/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-600 text-sm font-medium transition-all duration-200"
            >
              Login*
            </Link>
            <Link
              to="/user/register"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-600 text-sm font-medium transition-all duration-200"
            >
              Register*
            </Link>
            </div>
            
          </div>

          {/* Bottom section with Logout */}
          <div className="px-6 py-4 border-t-2 border-gray-300 bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;