import { Link, useLocation } from "react-router-dom";

const tabs = [
  {
    to: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: "/grapes",
    label: "GRAPES",
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <circle cx="12" cy="7"  r="2.5" fill="currentColor" />
        <circle cx="8"  cy="12" r="2.5" fill="currentColor" />
        <circle cx="16" cy="12" r="2.5" fill="currentColor" />
        <circle cx="12" cy="17" r="2.5" fill="currentColor" />
        <path d="M11 4.5 Q12 2 14.5 3" strokeLinecap="round" fill="none" strokeWidth="1.5" stroke="currentColor" />
      </svg>
    ),
  },
  {
    to: "/cogtri",
    label: "CogTri",
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
        <polygon points="12,3 2,21 22,21" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const BottomTabBar = () => {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/user/login" ||
    location.pathname === "/user/register";

  if (isAuthPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[530px] mx-auto bg-surface border-t-2 border-line flex z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      {tabs.map((tab) => {
        const isActive =
          tab.to === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.to);

        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors duration-150 ${
              isActive ? "text-primary-light" : "text-muted"
            }`}
          >
            {tab.icon(isActive)}
            <span
              className={`text-[10px] font-bold leading-none ${
                isActive ? "text-primary-light" : "text-muted"
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 w-1 h-1 rounded-full bg-primary-light" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;
