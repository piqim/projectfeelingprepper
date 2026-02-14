import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";


const App = () => {

  return (
    <div className="shadow-lg h-[930px] w-[430px] bg-neutral">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;