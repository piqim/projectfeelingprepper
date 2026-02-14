import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";


const App = () => {

  return (
    <div className="w-min-[430px] w-max-[530px] h-min-[600px] h-screen h-max-[930px] mx-auto bg-white">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;