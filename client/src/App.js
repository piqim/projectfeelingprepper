import logo from './logo.svg';
import './App.css';

import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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