import { CronJob, Job } from "@/types/job";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CreateCronJobs } from "./create-cron-jobs";

import { ApiService } from "@/services/api-service";
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
  const theme = useTheme();

  useEffect(() => {
    setJobs(initialJobs);
    setCronJobs(initialCronJobs);
    setUser(initialUser);
  }, [initialJobs, initialCronJobs, initialUser]);

  const handleDeleteCronJob = async (id: string) => {
    const response = await ApiService.deleteCronJobs({
      id,
      user_email: user.email,
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          borderRadius: "8px",
          border:
            theme.palette.mode === "light" ? "solid white" : "solid #4b5057",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h4
          style={{
            color: "#fff",
            padding: "20px",
            borderRadius: "8px",
            background: "rgba(0, 0, 0, 0.6)",
          }}
        >
          Please login to view your cron jobs
        </h4>
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
