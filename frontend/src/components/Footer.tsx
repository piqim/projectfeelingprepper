import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white shadow-inner px-4 py-3 flex flex-col items-center gap-2 text-sm text-gray-500">
      {/* Quick Nav Links */}
      <div className="flex gap-6">
        <Link to="/" className="hover:text-gray-800">
          Home
        </Link>
        <Link to="/learnmore" className="hover:text-gray-800">
          Learn More
        </Link>
        <Link to="/settings" className="hover:text-gray-800">
          Settings
        </Link>
      </div>

      {/* Divider */}
      <div className="w-full border-t"></div>

      {/* App Info */}
      <p className="text-xs text-gray-400">
        © {new Date().getFullYear()} FeelingPrepper · All rights reserved
      </p>
    </footer>
  );
};

export default Footer;
