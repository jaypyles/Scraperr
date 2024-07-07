import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useRouter } from "next/router";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Job {
  id: string;
  url: string;
  elements: Object[];
  result: Object;
  time_created: Date;
}

interface JobTableProps {
  jobs: Job[];
}

const JobTable: React.FC<JobTableProps> = ({ jobs }) => {
  const router = useRouter();

  const handleDownload = async (id: string) => {
    console.log(id);
    const response = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `job_${id}.csv`;
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

  return (
    <Box
      width="100%"
      bgcolor="background.default"
      display="flex"
      justifyContent="center"
    >
      <Box
        className="flex flex-col justify-center align-center items-center"
        width="100%"
        maxWidth="100%"
        bgcolor="background.default"
        p={3}
        overflow="auto"
      >
        <Typography variant="h4" gutterBottom>
          Scrape Jobs
        </Typography>
        <Box sx={{ overflow: "auto", width: "75%" }}>
          <Table sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableHead>
              <TableRow>
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
                        handleDownload(row.id);
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
