import './App.css';

import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";


const App = () => {
  const location = useLocation();
  
  // Optional: Hide Navbar/Footer for specific routes
  const hideLayout = location.pathname === '/admin/login'; // Example
  
  return (
    <div className="w-full">
      {!hideLayout && <Navbar />}
      <Outlet />
      {!hideLayout && <Footer />}
    </div>
  );
};

export default App;