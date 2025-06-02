import Cookies from "js-cookie";

export type DeleteJobParams = {
  ids: string[];
};

export const deleteJob = async (params: DeleteJobParams) => {
  const token = Cookies.get("token");

  const response = await fetch("/api/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: params }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete job");
  }

  return response;
};
