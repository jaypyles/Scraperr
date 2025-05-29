import Cookies from "js-cookie";

export type UpdateJobParams = {
  ids: string[];
  field: string;
  value: any;
};

export const updateJob = async (params: UpdateJobParams) => {
  const token = Cookies.get("token");

  const response = await fetch("/api/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: params }),
  });

  if (!response.ok) {
    throw new Error("Failed to update job");
  }

  return response.json();
};
