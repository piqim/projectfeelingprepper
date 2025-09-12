/* BASE REACT COMPONENT IMPORT */
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

/* CSS IMPORT */
import "./index.css";

/* PAGE COMPONENTS IMPORT */
import App from "./App";
// BASE COMPONENTS
import Home from "./components/Home.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import reportWebVitals from "./reportWebVitals";
// PAGES COMPONENTS
import Cogtri from "./components/pages/Cogtri.js";
import Grapes from "./components/pages/Grapes.js";
import Learnmore from "./components/pages/Learnmore.js";
import Settings from "./components/pages/Settings.js";
import Tipp from "./components/pages/Tipp.js";
import Dev from "./components/pages/Dev.js";

/* ROUTE(S) */
const router = createBrowserRouter([
  /* CLIENT SIDE ROUTE(S) */
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },

      // MAIN PAGES
      {
        path: "cogtri",
        children: [{ index: true, element: <Cogtri /> }],
      },
      {
        path: "grapes",
        children: [{ index: true, element: <Grapes /> }],
      },
      {
        path: "tipp",
        children: [{ index: true, element: <Tipp /> }],
      },
      {
        path: "learnmore",
        children: [{ index: true, element: <Learnmore /> }],
      },
    ],
  },

  /* USER ROUTE */
  {
    path: "/user",
    element: <App />,
    children: [
      {
        path: "login",
        children: [{ index: true, element: <Login /> }],
      },
      {
        path: "register",
        children: [{ index: true, element: <Register /> }],
      },
    ],
  },

  /* SETTINGS ROUTE */
  {
    path: "/settings",
    element: <App/>,
    children: [{ index: true, element: <Settings /> }],
  },

  /* DEV ROUTE */
  {
    path: "/dev",
    element: <Dev />,
  },
]);

/* PUBLISH ROUTES */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
