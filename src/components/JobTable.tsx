import React, { useState } from "react";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
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
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>id</TableCell>
            <TableCell>url</TableCell>
            <TableCell>elements</TableCell>
            <TableCell>result</TableCell>
            <TableCell>time_created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField variant="outlined" fullWidth value={row.id} />
              </TableCell>
              <TableCell>
                <TextField variant="outlined" fullWidth value={row.url} />
              </TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={JSON.stringify(row.elements)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={JSON.stringify(row.result)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={row.time_created}
                />
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    handleDownload(row.id);
                  }}
                >
                  Download
                </Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleNavigate(row.elements, row.url)}>
                  Rerun
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default JobTable;
