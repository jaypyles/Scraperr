import { Routes, Route, BrowserRouter } from "react-router-dom";
import React from "react";
import Layout from "./Layout";

export default function App() {
  return (
    <BrowserRouter>
      <div className="main-wrapper flex justify-center">
        <div className="main">
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <h1>Homepage</h1>
                </Layout>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
