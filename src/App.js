import React from 'react';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import Layout from './Layout';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      
    ]
  }
])

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
