import { JobSelector } from "@/components/common/job-selector";
import { useGetCurrentJobs } from "@/hooks/use-get-current-jobs";
import { useUserSettings } from "@/store/hooks";
import { Job } from "@/types";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const RecordingId = () => {
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { userSettings } = useUserSettings();
  const { jobs, setJobs } = useGetCurrentJobs();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const currentId = searchParams.get("id");

  const handleSelectJob = (job: Job | null) => {
    if (job) {
      router.push(`/recordings?id=${job.id}`);
    }
  };

  useEffect(() => {
    if (!userSettings.recordingsEnabled) {
      setError("Recordings are disabled");
      setLoading(false);
      return;
    }

    if (!currentId) {
      setError("No recording ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const url = `/api/recordings/${currentId}`;
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Video not found (status: ${res.status})`);
        }
        setVideoUrl(url);
      })
      .catch(() => {
        setError("404 recording not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentId, userSettings.recordingsEnabled]);

  useEffect(() => {
    if (!currentId) {
      setSelectedJob(null);
      return;
    }

    const job = jobs.find((j) => j.id === currentId);
    setSelectedJob(job || null);
  }, [currentId, jobs]);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === "light"
              ? theme.palette.grey[50]
              : theme.palette.grey[900],
          zIndex: 10,
        }}
      >
        <Box sx={{ width: "300px" }}>
          <JobSelector
            setSelectedJob={handleSelectJob}
            selectedJob={selectedJob}
            jobs={jobs}
            sxProps={{}}
          />
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          backgroundColor:
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          p: 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <CircularProgress />
            <Typography variant="body2" color="textSecondary">
              Loading recording...
            </Typography>
          </Box>
        ) : error ? (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              maxWidth: "500px",
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
            }}
          >
            <Alert
              severity="error"
              variant="filled"
              sx={{
                mb: 2,
                backgroundColor: theme.palette.error.main,
              }}
            >
              {error}
            </Alert>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Please select a different recording from the dropdown menu above
              or check if recordings are enabled.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              borderRadius: 1,
            }}
          >
            <video
              className="h-full w-full object-contain"
              controls
              onError={() => setError("Error loading video")}
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                borderRadius: "4px",
                boxShadow: theme.shadows[4],
              }}
            >
              <source src={videoUrl ?? undefined} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        )}
      </Box>
    </Box>
  );
};
