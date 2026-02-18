import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  // Check if current page is login or register
  const isAuthPage = location.pathname === "/user/login" || location.pathname === "/user/register";

  // Hide footer on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <footer className="relative w-full bg-dark shadow-inner px-4 py-3 flex flex-col items-center gap-2 text-sm text-gray-500">

      {/* App Info */}
      <p className="text-xs text-highlight">
        © {new Date().getFullYear()} FeelingPrepper · All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;
