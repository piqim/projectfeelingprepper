import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";


const App = () => {

  return (
    <div className="mx-auto shadow-sm min-h-full max-w-md">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;