import React, { useEffect, useState } from "react";
import { JobTable } from "../components/jobs";
import { useAuth } from "../contexts/AuthContext";
import { Box } from "@mui/system";
import { Job } from "../types";
import { GetServerSideProps } from "next/types";
import axios from "axios";
import { parseCookies } from "nookies";
import Cookies from "js-cookie";
import { fetchJobs } from "../lib";

interface JobsProps {
  initialJobs: Job[];
  initialUser: any;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookies = parseCookies({ req });
  const token = cookies.token;
  let user = null;
  let initialJobs: Job[] = [];

  if (token) {
    try {
      const userResponse = await axios.get(
        `http://scraperr_api:8000/api/auth/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      user = userResponse.data;

      const jobsResponse = await axios.post(
        `http://scraperr_api:8000/api/retrieve-scrape-jobs`,
        { user: user.email },
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      initialJobs = jobsResponse.data;
    } catch (error) {
      console.error("Error fetching user or jobs:", error);
    }
  }

  return {
    props: {
      initialJobs,
      initialUser: user,
    },
  };
};

const Jobs: React.FC<JobsProps> = ({ initialJobs, initialUser }) => {
  const { user, setUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);

  useEffect(() => {
    if (!user && initialUser) {
      setUser(initialUser);
    }
  }, [user, initialUser, setUser]);

  useEffect(() => {
    if (user) {
      fetchJobs(setJobs);
    } else {
      setJobs([]);
    }
  }, [user]);

  useEffect(() => {
    const intervalId = setInterval(fetchJobs, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {user ? (
        <JobTable jobs={jobs} setJobs={setJobs} />
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
