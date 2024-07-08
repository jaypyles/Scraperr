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
}

interface JobTableProps {
  jobs: Job[];
  fetchJobs: () => void;
}

const JobTable: React.FC<JobTableProps> = ({ jobs, fetchJobs }) => {
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
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
      a.download = `job_${ids.splice(0, 1)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      console.error("Failed to download the file.");
    }
  };

  const handleNavigate = (elements: Object[], url: string) => {
    router.push({
      pathname: "/",
      query: {
        elements: JSON.stringify(elements),
        url: url,
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
          className="flex flex-row w-3/4 items-center p-2"
          bgcolor="background.paper"
        >
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
        </Box>
        <Box sx={{ overflow: "auto", width: "75%" }}>
          <Table sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Id</TableCell>
                <TableCell>Url</TableCell>
                <TableCell>Elements</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Time Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((row, index) => (
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
                  <TableCell sx={{ maxWidth: 100, overflow: "auto" }}>
                    <Button
                      onClick={() => {
                        handleDownload([row.id]);
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() => handleNavigate(row.elements, row.url)}
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
