import React, { Dispatch, SetStateAction, useState } from "react";
import {
  IconButton,
  Box,
  Typography,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DownloadIcon from "@mui/icons-material/Download";
import StarIcon from "@mui/icons-material/Star";
import { useRouter } from "next/router";
import { Favorites, JobQueue } from ".";
import { Job } from "../../types";
import { Constants } from "../../lib";
import Cookies from "js-cookie";

interface JobTableProps {
  jobs: Job[];
  setJobs: React.Dispatch<SetStateAction<Job[]>>;
}

interface ColorMap {
  [key: string]: string;
}

const COLOR_MAP: ColorMap = {
  Queued: "rgba(255,201,5,0.25)",
  Scraping: "rgba(3,104,255,0.25)",
  Completed: "rgba(5,255,51,0.25)",
  Failed: "rgba(214,0,25,0.25)",
};

export const JobTable: React.FC<JobTableProps> = ({ jobs, setJobs }) => {
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchMode, setSearchMode] = useState<string>("url");
  const [favoriteView, setFavoriteView] = useState<boolean>(false);

  const token = Cookies.get("token");
  const router = useRouter();

  const handleDownload = async (ids: string[]) => {
    const response = await fetch(`${Constants.DOMAIN}/api/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ids }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `job_${ids[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      console.error("Failed to download the file.");
    }
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
    const response = await fetch(`${Constants.DOMAIN}/api/delete-scrape-jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedJobs) }),
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

    const postBody = {
      ids: ids,
      field: field,
      value: value,
    };

    await fetch(`${Constants.DOMAIN}/api/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postBody),
    });
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
                <IconButton color="primary" onClick={handleSelectAll}>
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
            ></JobQueue>
          ) : (
            <Favorites
              stateProps={{ selectedJobs, filteredJobs }}
              onNavigate={handleNavigate}
              onSelectJob={handleSelectJob}
              onFavorite={favoriteJob}
            ></Favorites>
          )}
        </Box>
      </Box>
    </Box>
  );
};
