import Cookies from "js-cookie";
import React, { Dispatch } from "react";
import { Job } from "../types";

interface fetchOptions {
  chat?: boolean;
}

export const fetchJobs = async (
  setJobs: Dispatch<React.SetStateAction<Job[]>>,
  fetchOptions: fetchOptions = {}
) => {
  const token = Cookies.get("token");
  await fetch(`/api/retrieve-scrape-jobs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fetchOptions),
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

export const updateJob = async (ids: string[], field: string, value: any) => {
  const token = Cookies.get("token");
  const postBody = {
    ids: ids,
    field: field,
    value: value,
  };
  await fetch(`/api/update`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postBody),
  }).catch((error) => {
    console.error("Error fetching jobs:", error);
  });
};
