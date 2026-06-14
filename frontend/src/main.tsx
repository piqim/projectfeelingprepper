/* BASE REACT COMPONENT IMPORT */
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

/* CSS IMPORT */
import "./index.css";

/* THEME — apply saved light/dark preference before first paint */
import { applyTheme, getStoredTheme } from "./hooks/useTheme.ts";
applyTheme(getStoredTheme());

/* PAGE COMPONENTS IMPORT */
import App from "./App";
// BASE COMPONENTS
import Home from "./components/Home.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import PublicRoute from "./components/PublicRoute.tsx";
// PAGES COMPONENTS
import Cogtri from "./components/pages/Cogtri.tsx";
import Grapes from "./components/pages/Grapes.tsx";
import Learnmore from "./components/pages/Learnmore.tsx";
import Settings from "./components/pages/Settings.tsx";
import Tipp from "./components/pages/Tipp.tsx";
import Analytics from "./components/pages/Analytics.tsx";
import Dev from "./components/pages/Dev.tsx";
import Legal from "./components/pages/Legal.tsx";

/* ROUTE(S) */
const router = createBrowserRouter([
  /* CLIENT SIDE ROUTE(S) */
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
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
      {
        path: "analytics",
        children: [{ index: true, element: <Analytics /> }],
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
        children: [
          {
            index: true,
            element: (
              <PublicRoute>
                <Login />
              </PublicRoute>
            ),
          },
        ],
      },
      {
        path: "register",
        children: [
          {
            index: true,
            element: (
              <PublicRoute>
                <Register />
              </PublicRoute>
            ),
          },
        ],
      },
    ],
  },

  /* SETTINGS ROUTE */
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <Settings /> }],
  },

  /* DEV ROUTE */
  {
    path: "/dev",
    element: <Dev />,
  },

  /* LEGAL ROUTE — public, no auth required */
  {
    path: "/legal",
    element: <Legal />,
  },
]);

/* PUBLISH ROUTES */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

