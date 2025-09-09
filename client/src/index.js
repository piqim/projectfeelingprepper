import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  // Client-Side Routes
  {
    path: "/",
    element: 
    <App />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "scholar",
        children: [
          { index: true, element: <Scholar /> },
          { path: "detail/:id", element: <ScholarDetail /> },
        ],
      },
      {
        path: "scholarship",
        children: [
          { index: true, element: <Scholarship /> },
          { path: "detail/:id", element: <ScholarshipDetail /> },
        ],
      },
    ],
  },

  // 🔒 Separate Login Route (NOT Protected)
  {
    path: "/admin/login",
    element: <Login />, // Public login page
  },

  // 🔒 Protected Admin Routes (Requires Auth)
  {
    path: "/admin",
    element: (
      <ProtectedLayout>  {/* Now only protects admin pages */}
        <App />
      </ProtectedLayout>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "scholar-list", element: <ScholarList /> },
      { path: "scholar-list/add", element: <AddScholar /> },
      { path: "scholar-list/edit/:id", element: <EditScholar /> },
      { path: "scholarship-list", element: <ScholarshipList /> },
      { path: "scholarship-list/add", element: <AddScholarship /> },
      { path: "scholarship-list/edit/:id", element: <EditScholarship /> },
    ],
  },

  {
    path: "/dev",
    element: <Dev />, // dev test page
  },

]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
