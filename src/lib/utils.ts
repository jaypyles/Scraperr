import Cookies from "js-cookie";
import React, { Dispatch, SetStateAction } from "react";
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

export const fetchJob = async (id: string) => {
  const token = Cookies.get("token");
  try {
    const response = await fetch(`/api/job/${id}`, {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

export const checkAI = async (
  setAiEnabled: Dispatch<React.SetStateAction<boolean>>
) => {
  const token = Cookies.get("token");
  try {
    const response = await fetch(`/api/ai/check`, {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setAiEnabled(data);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};
