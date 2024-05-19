import { Routes, Route, BrowserRouter } from "react-router-dom";
import React from "react";
import Layout from "./Layout";

const fetchDataFromFastAPI = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/endpoint");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

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
                  <div>
                    <h1>Homepage</h1>
                    <button onClick={fetchDataFromFastAPI}>Click me</button>
                  </div>
                </Layout>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
