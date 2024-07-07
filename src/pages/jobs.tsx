import React, { useEffect, useState } from "react";
import JobTable from "../components/JobTable";
import { useAuth } from "../contexts/AuthContext";
import { Box } from "@mui/system";

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);

  const fetchJobs = () => {
    fetch("/api/retrieve-scrape-jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user: user?.email }),
    })
      .then((response) => response.json())
      .then((data) => setJobs(data))
      .catch((error) => {
        console.error("Error fetching jobs:", error);
      });
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
    } else {
      setJobs([]);
    }
  }, [user]);

  return (
    <>
      {user ? (
        <JobTable jobs={jobs} fetchJobs={fetchJobs} />
      ) : (
        <Box
          bgcolor="background.default"
          minHeight="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <h4
            style={{
              color: "#fff",
              padding: "20px",
              borderRadius: "8px",
              background: "rgba(0, 0, 0, 0.6)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            Previous jobs not viewable unless logged in.
          </h4>
        </Box>
      )}
    </>
  );
};

export default Jobs;
