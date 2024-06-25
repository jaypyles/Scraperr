import React from "react";

const fetchDataFromFastAPI = async () => {
  try {
    const response = await fetch("/api/endpoint");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const Home = () => {
  return (
    <>
      <h1>Webapp</h1>
    </>
  );
};

export default Home;
