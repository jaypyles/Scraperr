import { Job } from "@/types";

import { fetchJobs } from "@/lib";

import { useState } from "react";

import { useEffect } from "react";

export const useGetCurrentJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetchJobs(setJobs);
  }, []);

  return { jobs, setJobs };
};
