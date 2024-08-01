"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import { Job } from "../../types";
import { AutoAwesome } from "@mui/icons-material";
import { useRouter } from "next/router";

interface stringMap {
  [key: string]: string;
}

interface stateProps {
  selectedJobs: Set<string>;
  filteredJobs: Job[];
}

interface Props {
  colors: stringMap;
  onSelectJob: (job: string) => void;
  onDownload: (job: string[]) => void;
  onNavigate: (elements: Object[], url: string, options: any) => void;
  onFavorite: (ids: string[], field: string, value: any) => void;
  stateProps: stateProps;
}

export const JobQueue = ({
  stateProps,
  colors,
  onSelectJob,
  onDownload,
  onNavigate,
  onFavorite,
}: Props) => {
  const { selectedJobs, filteredJobs } = stateProps;
  const router = useRouter();

  return (
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
                onChange={() => onSelectJob(row.id)}
              />
              <Tooltip title="Chat with AI">
                <span>
                  <IconButton
                    onClick={() => {
                      router.push({
                        pathname: "/chat",
                        query: {
                          job: row.id,
                        },
                      });
                    }}
                  >
                    <AutoAwesome />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Favorite Job">
                <span>
                  <IconButton
                    color={row.favorite ? "warning" : "default"}
                    onClick={() => {
                      onFavorite([row.id], "favorite", !row.favorite);
                      row.favorite = !row.favorite;
                    }}
                  >
                    <StarIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </TableCell>
            <TableCell sx={{ maxWidth: 100, overflow: "auto" }}>
              <Box sx={{ maxHeight: 100, overflow: "auto" }}>{row.id}</Box>
            </TableCell>
            <TableCell sx={{ maxWidth: 200, overflow: "auto" }}>
              <Box sx={{ maxHeight: 100, overflow: "auto" }}>{row.url}</Box>
            </TableCell>
            <TableCell sx={{ maxWidth: 150, overflow: "auto" }}>
              <Box sx={{ maxHeight: 100, overflow: "auto" }}>
                {JSON.stringify(row.elements)}
              </Box>
            </TableCell>
            <TableCell sx={{ maxWidth: 150, overflow: "auto", padding: 0 }}>
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
            <TableCell sx={{ maxWidth: 50, overflow: "auto" }}>
              <Box sx={{ maxHeight: 100, overflow: "auto" }}>
                <Box
                  className="rounded-md p-2 text-center"
                  sx={{ bgcolor: colors[row.status] }}
                >
                  {row.status}
                </Box>
              </Box>
            </TableCell>
            <TableCell sx={{ maxWidth: 150, overflow: "auto" }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  onClick={() => {
                    onDownload([row.id]);
                  }}
                  size="small"
                  sx={{ minWidth: 0, padding: "4px 8px" }}
                >
                  Download
                </Button>
                <Button
                  onClick={() =>
                    onNavigate(row.elements, row.url, row.job_options)
                  }
                  size="small"
                  sx={{ minWidth: 0, padding: "4px 8px" }}
                >
                  Rerun
                </Button>
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
