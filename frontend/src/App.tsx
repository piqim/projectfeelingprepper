import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";


const App = () => {

  return (
    <div className="max-w-sm mx-auto shadow-sm min-h-full">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;