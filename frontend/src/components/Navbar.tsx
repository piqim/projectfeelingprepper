import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsOpen(false);

    // TODO: clear auth/session state here if needed
    console.log("Logout clicked");

    // Navigate to login page
    navigate("/user/login");
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="w-full bg-white shadow px-4 py-3 flex items-center justify-between">
        {/* Burger + Logo */}
        <div className="flex items-center gap-3">
          {/* Burger button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col justify-center items-center w-8 h-8"
          >
            <span
              className={`h-0.5 w-6 bg-black rounded transition-all duration-300 ${
                isOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-black rounded my-1 transition-all duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-black rounded transition-all duration-300 ${
                isOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </button>

          {/* Logo / Title */}
          <div className="text-lg font-bold">
            <Link to="/" className="hover:text-gray-700">
              FeelingPrepper
            </Link>
          </div>
        </div>
      </nav>

      {/* Sidebar / Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-full bg-white z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Exit button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="text-2xl absolute font-bold text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full justify-between p-6">
          {/* Profile section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gray-300 rounded-full" />
              <div>
                <p className="font-medium">Piqim</p>
                <p className="text-sm text-gray-500">User Profile</p>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex flex-col gap-6 text-lg font-medium">
              <Link to="/" onClick={() => setIsOpen(false)}>
                Home
              </Link>

              <div>
                <p className="mb-2">Techniques</p>
                <div className="ml-4 flex flex-col gap-2 text-base text-gray-700">
                  <Link to="/grapes" onClick={() => setIsOpen(false)}>
                    GRAPES
                  </Link>
                  <Link to="/cogtri" onClick={() => setIsOpen(false)}>
                    Cog Tri
                  </Link>
                </div>
              </div>

              <Link to="/learnmore" onClick={() => setIsOpen(false)}>
                Learn More
              </Link>

              <Link to="/settings" onClick={() => setIsOpen(false)}>
                Settings
              </Link>

              {/* Extra: user routes */}
              <Link to="/user/login" onClick={() => setIsOpen(false)}>
                Login*
              </Link>
              <Link to="/user/register" onClick={() => setIsOpen(false)}>
                Register*
              </Link>

              <div className="border-t pt-4">
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
