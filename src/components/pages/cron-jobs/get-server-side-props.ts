import axios from "axios";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { CronJob, Job } from "../../../types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookies = parseCookies({ req });
  const token = cookies.token;
  let user = null;
  let initialJobs: Job[] = [];
  let initialCronJobs: CronJob[] = [];
  if (token) {
    try {
      const userResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      user = userResponse.data;

      const jobsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/retrieve-scrape-jobs`,
        {
          method: "POST",
          body: JSON.stringify({ user: user.email }),
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      initialJobs = await jobsResponse.json();
      console.log(initialJobs);

      const cronJobsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cron-jobs`,
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      initialCronJobs = await cronJobsResponse.json();
    } catch (error) {
      console.error("Error fetching user or jobs:", error);
    }
  }

  return {
    props: {
      initialJobs,
      initialUser: user,
      initialCronJobs,
    },
  };
};
