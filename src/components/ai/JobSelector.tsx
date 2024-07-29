import React, { useState, useEffect, Dispatch } from "react";
import { Job } from "../../types";
import { fetchJobs } from "../../lib";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Popover from "@mui/material/Popover";
import { Typography } from "@mui/material";
import { SxProps } from "@mui/material";

interface Props {
  sxProps: SxProps;
  setSelectedJob: Dispatch<React.SetStateAction<Job | null>>;
  selectedJob: Job | null;
}

export const JobSelector = ({
  sxProps,
  selectedJob,
  setSelectedJob,
}: Props) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverJob, setPopoverJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs(setJobs);
  }, []);

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement>,
    job: Job
  ) => {
    setAnchorEl(event.currentTarget);
    setPopoverJob(job);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverJob(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={sxProps}>
      <FormControl fullWidth>
        <InputLabel id="select-job">Job</InputLabel>
        {jobs.length ? (
          <Select
            labelId="select-job"
            id="select-job"
            value={selectedJob?.id || ""}
            label="Job"
            onChange={(e) => {
              handlePopoverClose();
              setSelectedJob(
                jobs.find((job) => job.id === e.target.value) || null
              );
            }}
          >
            {jobs.map((job) => (
              <MenuItem
                key={job.id}
                value={job.id}
                aria-owns={open ? "mouse-over-popover" : undefined}
                aria-haspopup="true"
                onMouseEnter={(e) => handlePopoverOpen(e, job)}
                onMouseLeave={handlePopoverClose}
              >
                {job.id}
              </MenuItem>
            ))}
          </Select>
        ) : null}
      </FormControl>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {popoverJob && (
          <>
            <Typography sx={{ p: 1 }}>{popoverJob.url}</Typography>
            <Typography sx={{ p: 1 }}>
              {String(popoverJob.time_created)}
            </Typography>
          </>
        )}
      </Popover>
    </Box>
  );
};
