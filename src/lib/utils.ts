import Cookies from "js-cookie";
import React, { Dispatch } from "react";
import { Job } from "../types";

export const fetchJobs = async (
  setJobs: Dispatch<React.SetStateAction<Job[]>>
) => {
  const token = Cookies.get("token");
  await fetch(`/api/retrieve-scrape-jobs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => setJobs(data))
    .catch((error) => {
      console.error("Error fetching jobs:", error);
    });
};
