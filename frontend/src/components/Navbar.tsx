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
        className="fixed top-0 left-0 right-0 max-w-[530px] mx-auto bg-dark shadow-md z-50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-4 flex items-center justify-center">
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