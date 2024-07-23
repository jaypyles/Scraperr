import React, { useEffect, useState } from "react";
import JobTable from "../components/JobTable";
import { useAuth } from "../contexts/AuthContext";
import { Box } from "@mui/system";
import { Constants } from "../lib";
import { Job } from "../types";
import { GetServerSideProps } from "next";
import axios from "axios";
import { cookies } from "next/headers";

interface JobsProps {
  initialJobs: Job[];
  initialUser: any;
}

const Jobs: React.FC<JobsProps> = ({ initialJobs, initialUser }) => {
  const { user, setUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);

  useEffect(() => {
    if (!user && initialUser) {
      setUser(initialUser);
    }
  }, [user, initialUser, setUser]);

  const fetchJobs = async () => {
    await fetch(`${Constants.DOMAIN}/api/retrieve-scrape-jobs`, {
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

  useEffect(() => {
    const intervalId = setInterval(fetchJobs, 5000);
    return () => clearInterval(intervalId);
  }, []);

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;

  const cookies = cookies.parse(req.headers.cookie || "");
  const token = cookies.token;
  let user = null;
  let initialJobs: Job[] = [];

  if (token) {
    try {
      const userResponse = await axios.get(
        `${Constants.DOMAIN}/api/auth/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      user = userResponse.data;

      const jobsResponse = await axios.post(
        `${Constants.DOMAIN}/api/retrieve-scrape-jobs`,
        { user: user.email },
        { headers: { "content-type": "application/json" } }
      );

      initialJobs = jobsResponse.data;
    } catch (error) {
      console.error("Error fetching user or jobs:", error);
      res.setHeader(
        "Set-Cookie",
        cookies.serialize("token", "", {
          maxAge: -1,
          path: "/",
        })
      );
    }
  }

  return {
    props: {
      initialJobs,
      initialUser: user,
    },
  };
};

export default Jobs;
