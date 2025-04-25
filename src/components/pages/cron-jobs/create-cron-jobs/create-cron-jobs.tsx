import { Job } from "@/types";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import Cookies from "js-cookie";
import { useState } from "react";

export type CreateCronJobsProps = {
  availableJobs: Job[];
  user: any;
};

export const CreateCronJobs = ({
  availableJobs,
  user,
}: CreateCronJobsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ borderRadius: 2 }}
      >
        Create Cron Job
      </Button>
      <CreateCronJobDialog
        open={open}
        onClose={() => setOpen(false)}
        availableJobs={availableJobs}
        user={user}
      />
    </>
  );
};

const CreateCronJobDialog = ({
  open,
  onClose,
  availableJobs,
  user,
}: {
  open: boolean;
  onClose: () => void;
  availableJobs: Job[];
  user: any;
}) => {
  const [cronExpression, setCronExpression] = useState("");
  const [jobId, setJobId] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!cronExpression || !jobId) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const token = Cookies.get("token");

    try {
      const response = await fetch("/api/schedule-cron-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            cron_expression: cronExpression,
            job_id: jobId,
            user_email: user.email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule job");
      }

      setSuccessOpen(true);
      setCronExpression("");
      setJobId("");
      setTimeout(() => {
        onClose();
      }, 1500);
      window.location.reload();
    } catch (error) {
      console.error(error);
      setError("Failed to create cron job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccessOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: "400px" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 500 }}>Create Cron Job</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-1 mt0">
            <TextField
              label="Cron Expression"
              fullWidth
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              variant="outlined"
              placeholder="* * * * *"
              margin="normal"
              helperText="Format: minute hour day month day-of-week"
            />

            <TextField
              label="Job ID"
              fullWidth
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              variant="outlined"
              margin="normal"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ borderRadius: 2 }}
              >
                {isSubmitting ? "Submitting..." : "Create Job"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Cron job created successfully!
        </Alert>
      </Snackbar>
    </>
  );
};
