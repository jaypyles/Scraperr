import Cookies from "js-cookie";

export type DeleteCronJobsParams = {
  id: string;
  user_email: string;
};

export const deleteCronJobs = async (params: DeleteCronJobsParams) => {
  const token = Cookies.get("token");

  const response = await fetch("/api/delete-cron-job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: params }),
  });

  return response;
};
