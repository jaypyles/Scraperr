import React, { useEffect, useState } from "react";
import JobTable from "../components/JobTable";
import { useAuth } from "../hooks/useAuth";

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (user) {
      fetch("/api/retrieve-scrape-jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user: user?.email }),
      })
        .then((response) => response.json())
        .then((data) => setJobs(data));
    }
  }, [user]);

  return <JobTable jobs={jobs} />;
};

export default Jobs;
