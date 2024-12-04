import React from 'react';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Layout from './Layout';
import PrivateRoute from './utils/PrivateRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      { path: '/', element: <Home />},
      { path: 'about', element: <About />},
      { path: 'contact', element: <Contact />},
      { path: 'services', element: <Services />},
      { path: 'login', element: <Login />},
      { path: 'dashboard', element: <PrivateRoute><Dashboard /></PrivateRoute>},
    ]
  }
])

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
