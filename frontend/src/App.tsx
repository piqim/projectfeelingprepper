import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";


const App = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      setIsLandscape(window.matchMedia("(orientation: landscape)").matches);
    };

    const tryLockPortrait = async () => {
      try {
        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (orientation: string) => Promise<void>;
        };

        if ("orientation" in screen && typeof orientation.lock === "function") {
          await orientation.lock("portrait");
        }
      } catch {
      }
    };

    updateOrientation();
    void tryLockPortrait();

    const mediaQuery = window.matchMedia("(orientation: landscape)");
    mediaQuery.addEventListener("change", updateOrientation);

    const onFirstInteraction = () => {
      void tryLockPortrait();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };

    window.addEventListener("pointerdown", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });

    return () => {
      mediaQuery.removeEventListener("change", updateOrientation);
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  if (isLandscape) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Portrait Mode Required</h1>
          <p className="mt-3 text-base text-gray-700">Please rotate your device to vertical to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-max-[530px] h-max-[930px] mx-auto bg-white">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;