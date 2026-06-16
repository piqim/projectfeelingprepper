import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/user/login" ||
    location.pathname === "/user/register";

  if (isAuthPage) return null;

  return (
    <>
      <nav
        className="fixed top-0 inset-x-0 bg-dark shadow-md z-50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[530px] mx-auto h-14 px-4 flex items-center justify-center">
          <Link
            to="/"
            className="text-xl font-bold montserrat-alternates text-highlight hover:text-accent-2 transition-colors duration-200"
          >
            FeelingPrepper
          </Link>
        </div>
      </nav>
      <div style={{ height: 'calc(3.5rem + env(safe-area-inset-top))' }} />
    </>
  );
};

export default Navbar;