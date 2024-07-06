import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import JobTable from "../components/JobTable";

const Jobs = () => {
  const { user } = useAuth0();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("/api/retrieve-scrape-jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user: user?.name }),
    })
      .then((response) => response.json())
      .then((data) => setJobs(data));
  }, []);

  return (
    <>
      <JobTable jobs={jobs} />
    </>
  );
};

export default Jobs;
