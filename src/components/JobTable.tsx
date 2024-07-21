import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Tooltip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import { useRouter } from "next/router";

interface Job {
  id: string;
  url: string;
  elements: Object[];
  result: Object;
  time_created: Date;
  status: string;
  job_options: Object;
}

interface JobTableProps {
  jobs: Job[];
  fetchJobs: () => void;
}

interface ColorMap {
  [key: string]: string;
}

const COLOR_MAP: ColorMap = {
  Queued: "rgba(255,201,5,0.5)",
  Scraping: "rgba(3,104,255,0.5)",
  Completed: "rgba(5,255,51,0.5)",
};

const JobTable: React.FC<JobTableProps> = ({ jobs, fetchJobs }) => {
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchMode, setSearchMode] = useState<string>("url");

  const router = useRouter();

  const handleDownload = async (ids: string[]) => {
    const response = await fetch("/api/download", {
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
      a.download = `job_${ids.splice(0, 1)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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
    const response = await fetch("/api/delete-scrape-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedJobs) }),
    });

    if (response.ok) {
      fetchJobs();
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
          <Table sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Id</TableCell>
                <TableCell>Url</TableCell>
                <TableCell>Elements</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Time Created</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.map((row, index) => (
                <TableRow key={index}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedJobs.has(row.id)}
                      onChange={() => handleSelectJob(row.id)}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 100, overflow: "auto" }}>
                    <Box sx={{ maxHeight: 100, overflow: "auto" }}>
                      {row.id}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: "auto" }}>
                    <Box sx={{ maxHeight: 100, overflow: "auto" }}>
                      {row.url}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "auto" }}>
                    <Box sx={{ maxHeight: 100, overflow: "auto" }}>
                      {JSON.stringify(row.elements)}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ maxWidth: 150, overflow: "auto", padding: 0 }}
                  >
                    <Accordion sx={{ margin: 0, padding: 0.5 }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        sx={{
                          minHeight: 0,
                          "&.Mui-expanded": { minHeight: 0 },
                        }}
                      >
                        <Box
                          sx={{
                            maxHeight: 150,
                            overflow: "auto",
                            width: "100%",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            Show Result
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ padding: 1 }}>
                        <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {JSON.stringify(row.result, null, 2)}
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "auto" }}>
                    <Box sx={{ maxHeight: 100, overflow: "auto" }}>
                      {new Date(row.time_created).toLocaleString()}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "auto" }}>
                    <Box sx={{ maxHeight: 100, overflow: "auto" }}>
                      <Box
                        className="rounded-md p-2 text-center"
                        sx={{ bgcolor: COLOR_MAP[row.status], opactity: "50%" }}
                      >
                        {row.status}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 100, overflow: "auto" }}>
                    <Button
                      onClick={() => {
                        handleDownload([row.id]);
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() =>
                        handleNavigate(row.elements, row.url, row.job_options)
                      }
                    >
                      Rerun
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default JobTable;
