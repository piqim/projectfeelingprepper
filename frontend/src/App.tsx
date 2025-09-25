import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";


const App = () => {

  return (
    <div className="w-full min-h-full">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;