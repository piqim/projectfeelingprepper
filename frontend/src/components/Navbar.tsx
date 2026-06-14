import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/user/login" ||
    location.pathname === "/user/register";

  if (isAuthPage) return null;

  return (
    <>
      <nav className="fixed w-full max-w-[530px] h-14 bg-dark shadow-md px-4 flex items-center justify-center z-50">
        <Link
          to="/"
          className="text-xl font-bold montserrat-alternates text-highlight hover:text-accent-2 transition-colors duration-200"
        >
          FeelingPrepper
        </Link>
      </nav>
      <div className="h-14" />
    </>
  );
};

export default Navbar;