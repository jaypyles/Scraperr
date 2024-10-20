import React, { useEffect, useState } from "react";
import { JobTable } from "../components/jobs";
import { useAuth } from "../contexts/AuthContext";
import { Job } from "../types";
import { GetServerSideProps } from "next/types";
import axios from "axios";
import { parseCookies } from "nookies";
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
    fetchJobs(setJobs);
  }, [user]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchJobs(setJobs);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return <JobTable jobs={jobs} setJobs={setJobs} />;
};

export default Jobs;
