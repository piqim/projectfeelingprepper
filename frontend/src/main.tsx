/* BASE REACT COMPONENT IMPORT */
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

/* CSS IMPORT */
import "./index.css";

/* PAGE COMPONENTS IMPORT */
import App from "./App";
// BASE COMPONENTS
import Home from "./components/Home.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
// PAGES COMPONENTS
import Cogtri from "./components/pages/Cogtri.tsx";
import Grapes from "./components/pages/Grapes.tsx";
import Learnmore from "./components/pages/Learnmore.tsx";
import Settings from "./components/pages/Settings.tsx";
import Tipp from "./components/pages/Tipp.tsx";
import Dev from "./components/pages/Dev.tsx";

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
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

