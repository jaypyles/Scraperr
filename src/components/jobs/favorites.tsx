import React from "react";
import {
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Checkbox,
  Button,
} from "@mui/material";
import { Job } from "../../types";
import StarIcon from "@mui/icons-material/Star";

interface stateProps {
  selectedJobs: Set<string>;
  filteredJobs: Job[];
}

interface Props {
  onSelectJob: (job: string) => void;
  onNavigate: (elements: Object[], url: string, options: any) => void;
  onFavorite: (ids: string[], field: string, value: any) => void;
  stateProps: stateProps;
}

export const Favorites = ({
  stateProps,
  onSelectJob,
  onNavigate,
  onFavorite,
}: Props) => {
  const { selectedJobs, filteredJobs } = stateProps;
  const favoritedJobs = filteredJobs.filter((job) => job.favorite);

  return (
    <Table sx={{ tableLayout: "fixed", width: "100%" }}>
      <TableHead>
        <TableRow>
          <TableCell>Select</TableCell>
          <TableCell>Id</TableCell>
          <TableCell>Url</TableCell>
          <TableCell>Elements</TableCell>
          <TableCell>Time Created</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {favoritedJobs.map((row, index) => (
          <TableRow key={index}>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedJobs.has(row.id)}
                onChange={() => onSelectJob(row.id)}
              />
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
            <TableCell sx={{ maxWidth: 150, overflow: "auto" }}>
              <Box sx={{ maxHeight: 100, overflow: "auto" }}>
                {new Date(row.time_created).toLocaleString()}
              </Box>
            </TableCell>
            <TableCell sx={{ maxWidth: 100, overflow: "auto" }}>
              <Button
                onClick={() =>
                  onNavigate(row.elements, row.url, row.job_options)
                }
              >
                Run
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
