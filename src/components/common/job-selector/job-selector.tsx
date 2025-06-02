import { Job } from "@/types";
import {
  ClickAwayListener,
  MenuItem,
  SxProps,
  Typography,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import React, { Dispatch, useEffect, useState } from "react";

interface Props {
  sxProps?: SxProps;
  setSelectedJob:
    | Dispatch<React.SetStateAction<Job | null>>
    | ((job: Job) => void);
  selectedJob: Job | null;
  jobs: Job[];
}

export const JobSelector = ({
  sxProps,
  selectedJob,
  setSelectedJob,
  jobs,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverJob, setPopoverJob] = useState<Job | null>(null);
  const theme = useTheme();

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

  useEffect(() => {
    if (!open) {
      setAnchorEl(null);
    }
  }, [open]);

  return (
    <Box sx={sxProps}>
      <FormControl fullWidth>
        {jobs.length ? (
          <>
            <InputLabel id="select-job">Job</InputLabel>
            <Select
              labelId="select-job"
              id="select-job"
              value={selectedJob?.id || ""}
              label="Job"
              onChange={(e) => {
                const job = jobs.find((job) => job.id === e.target.value);

                if (job) {
                  setSelectedJob(job);
                }
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
                  onClick={handlePopoverClose}
                >
                  {job.id}
                </MenuItem>
              ))}
            </Select>
          </>
        ) : null}
      </FormControl>

      {open && (
        <ClickAwayListener onClickAway={handlePopoverClose}>
          <Popover
            id="mouse-over-popover"
            sx={{
              pointerEvents: "none",
              padding: 0,
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
          >
            {popoverJob && (
              <Box
                sx={{
                  border:
                    theme.palette.mode === "light"
                      ? "2px solid black"
                      : "2px solid white",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ paddingLeft: 1, paddingRight: 1 }}
                >
                  {popoverJob.url}
                </Typography>
                <div className="flex flex-row w-full justify-end mb-1">
                  <Typography
                    variant="body2"
                    sx={{
                      paddingLeft: 1,
                      paddingRight: 1,
                      color:
                        theme.palette.mode === "dark" ? "#d3d7e6" : "#5b5d63",
                      fontStyle: "italic",
                    }}
                  >
                    {popoverJob.time_created
                      ? new Date(popoverJob.time_created).toLocaleString()
                      : "Unknown"}
                  </Typography>
                </div>
              </Box>
            )}
          </Popover>
        </ClickAwayListener>
      )}
    </Box>
  );
};
