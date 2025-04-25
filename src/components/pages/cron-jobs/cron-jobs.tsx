import { Job, CronJob } from "@/types/job";
import { useState, useEffect } from "react";
import { CreateCronJobs } from "./create-cron-jobs";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
  Typography,
} from "@mui/material";
import Cookies from "js-cookie";

export type CronJobsProps = {
  initialJobs: Job[];
  initialCronJobs: CronJob[];
  initialUser: any;
};

export const CronJobs = ({
  initialJobs,
  initialCronJobs,
  initialUser,
}: CronJobsProps) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [cronJobs, setCronJobs] = useState<CronJob[]>(initialCronJobs);
  const [user, setUser] = useState<any>(initialUser);

  useEffect(() => {
    setJobs(initialJobs);
    setCronJobs(initialCronJobs);
    setUser(initialUser);
  }, [initialJobs, initialCronJobs, initialUser]);

  const handleDeleteCronJob = async (id: string) => {
    const token = Cookies.get("token");
    const response = await fetch("/api/delete-cron-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { id, user_email: user.email } }),
    });

    if (response.ok) {
      console.log("Cron job deleted successfully");
      setCronJobs(cronJobs.filter((cronJob) => cronJob.id !== id));
    } else {
      console.error("Failed to delete cron job");
    }
  };

  if (!user) {
    return (
      <Box>
        <Typography variant="h6">
          Please login to view your cron jobs
        </Typography>
      </Box>
    );
  }

  return (
    <div>
      <CreateCronJobs availableJobs={jobs} user={user} />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cron Expression</TableCell>
            <TableCell>Job ID</TableCell>
            <TableCell>User Email</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cronJobs.map((cronJob) => (
            <TableRow key={cronJob.id}>
              <TableCell>{cronJob.cron_expression}</TableCell>
              <TableCell>{cronJob.job_id}</TableCell>
              <TableCell>{cronJob.user_email}</TableCell>
              <TableCell>
                {new Date(cronJob.time_created).toLocaleString()}
              </TableCell>
              <TableCell>
                {new Date(cronJob.time_updated).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleDeleteCronJob(cronJob.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
