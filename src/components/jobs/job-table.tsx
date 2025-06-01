import { JobDownloadDialog } from "@/components/common/job-download-dialog";
import { ApiService } from "@/services";
import { COLOR_MAP, Job } from "@/types";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import StarIcon from "@mui/icons-material/Star";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { SetStateAction, useState } from "react";
import { Favorites, JobQueue } from ".";

interface JobTableProps {
  jobs: Job[];
  setJobs: React.Dispatch<SetStateAction<Job[]>>;
}

export const JobTable: React.FC<JobTableProps> = ({ jobs, setJobs }) => {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const type = searchParams.get("type");

  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>(search || "");
  const [searchMode, setSearchMode] = useState<string>(type || "url");
  const [favoriteView, setFavoriteView] = useState<boolean>(false);
  const [jobDownloadDialogOpen, setJobDownloadDialogOpen] =
    useState<boolean>(false);

  const router = useRouter();

  const handleDownload = (ids: string[]) => {
    setSelectedJobs(new Set(ids));
    setJobDownloadDialogOpen(true);
  };

  const handleNavigate = (elements: Object[], url: string, options: any) => {
    router.push({
      pathname: "/",
      query: {
        elements: JSON.stringify(elements),
        url: url,
        job_options: JSON.stringify(options),
      },
    });
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobs((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }

      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedJobs(new Set());
    } else {
      const allJobIds = new Set(jobs.map((job) => job.id));
      setSelectedJobs(allJobIds);
    }

    setAllSelected(!allSelected);
  };

  const handleDeleteSelected = async () => {
    const response = await ApiService.deleteJob({
      ids: Array.from(selectedJobs),
    });

    if (response.ok) {
      setJobs((jobs) =>
        jobs.filter((job) => !Array.from(selectedJobs).includes(job.id))
      );
      setSelectedJobs(new Set());
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (searchMode === "url") {
      return job.url.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchMode === "id") {
      return job.id.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchMode === "status") {
      return job.status.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const favoriteJob = async (ids: string[], field: string, value: any) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        ids.includes(job.id) ? { ...job, [field]: value } : job
      )
    );

    await ApiService.updateJob({
      ids: ids,
      field: field,
      value: value,
    });
  };

  const handleJobClick = (job: Job) => {
    router.push(`/job/csv/${job.id}`);
  };

  return (
    <Box
      width="100%"
      bgcolor="background.default"
      display="flex"
      justifyContent="center"
      minHeight="100vh"
    >
      <Box
        className="flex flex-col justify-start align-center items-center"
        width="100%"
        maxWidth="100%"
        bgcolor="background.default"
        overflow="auto"
      >
        <Box
          className="flex flex-row justify-between p-2 w-full"
          bgcolor="background.paper"
        >
          <div className="flex flex-row w-1/2 items-center p-2">
            <Typography className="mr-2" variant="body1">
              Scrape Jobs
            </Typography>
            <Tooltip title="Select All">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleSelectAll}
                  data-testid="select-all"
                  aria-label="Select All"
                >
                  <SelectAllIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete Selected">
              <span>
                <IconButton
                  color="secondary"
                  onClick={handleDeleteSelected}
                  disabled={selectedJobs.size === 0}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Download Selected">
              <span>
                <IconButton
                  color="primary"
                  onClick={() => handleDownload(Array.from(selectedJobs))}
                  disabled={selectedJobs.size === 0}
                >
                  <DownloadIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Favorites">
              <span>
                <IconButton
                  color={favoriteView ? "warning" : "default"}
                  onClick={() => setFavoriteView(!favoriteView)}
                >
                  <StarIcon />
                </IconButton>
              </span>
            </Tooltip>
          </div>
          <div className="flex flex-row space-x-2 w-1/2">
            <TextField
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-3/4"
            />
            <FormControl className="w-1/2">
              <InputLabel id="search-mode-label">Search Mode</InputLabel>
              <Select
                labelId="search-mode-label"
                id="search-mode"
                value={searchMode}
                label="Mode"
                onChange={(e: SelectChangeEvent) =>
                  setSearchMode(e.target.value as string)
                }
              >
                <MenuItem value="url">URL</MenuItem>
                <MenuItem value="id">ID</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Box>
        <Box sx={{ overflow: "auto" }}>
          {!favoriteView ? (
            <JobQueue
              stateProps={{ selectedJobs, filteredJobs }}
              colors={COLOR_MAP}
              onDownload={handleDownload}
              onNavigate={handleNavigate}
              onSelectJob={handleSelectJob}
              onFavorite={favoriteJob}
              onJobClick={handleJobClick}
            />
          ) : (
            <Favorites
              stateProps={{ selectedJobs, filteredJobs }}
              onNavigate={handleNavigate}
              onSelectJob={handleSelectJob}
              onFavorite={favoriteJob}
            />
          )}
        </Box>
      </Box>
      <JobDownloadDialog
        open={jobDownloadDialogOpen}
        onClose={() => setJobDownloadDialogOpen(false)}
        ids={Array.from(selectedJobs)}
      />
    </Box>
  );
};
