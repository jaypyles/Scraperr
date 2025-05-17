"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Checkbox,
  Button,
  Tooltip,
  IconButton,
  TableContainer,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { Job } from "../../types";
import { AutoAwesome, Image, VideoCameraBack } from "@mui/icons-material";
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
  onJobClick: (job: Job) => void;
  stateProps: stateProps;
}

export const JobQueue = ({
  stateProps,
  colors,
  onSelectJob,
  onDownload,
  onNavigate,
  onFavorite,
  onJobClick,
}: Props) => {
  const { selectedJobs, filteredJobs } = stateProps;
  const router = useRouter();

  return (
    <TableContainer component={Box} sx={{ maxHeight: "90dvh" }}>
      <Table sx={{ tableLayout: "fixed", width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "280px" }}>Select</TableCell>
            <TableCell>Id</TableCell>
            <TableCell>Url</TableCell>
            <TableCell>Elements</TableCell>
            <TableCell>Result</TableCell>
            <TableCell>Time Created</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ overflow: "auto" }}>
          {filteredJobs.map((row, index) => (
            <TableRow key={index}>
              <TableCell padding="checkbox" sx={{ width: "280px" }}>
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
                <Tooltip title="View Recording">
                  <span>
                    <IconButton
                      onClick={() => {
                        router.push({
                          pathname: "/recordings",
                          query: {
                            id: row.id,
                          },
                        });
                      }}
                    >
                      <VideoCameraBack />
                    </IconButton>
                  </span>
                </Tooltip>
                {row.job_options.collect_media && (
                  <Tooltip title="View Media">
                    <span>
                      <IconButton
                        onClick={() => {
                          router.replace(`/media?id=${row.id}`);
                        }}
                      >
                        <Image />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell sx={{ maxWidth: 100, overflow: "auto" }}>
                <Box
                  sx={{
                    maxHeight: 100,
                    overflow: "auto",
                  }}
                >
                  {row.id}
                </Box>
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
                <Box
                  sx={{
                    maxHeight: 100,
                    overflow: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    sx={{
                      fontSize: "0.875rem",
                    }}
                    onClick={() => onJobClick(row)}
                  >
                    Show Result
                  </Button>
                </Box>
              </TableCell>
              <TableCell sx={{ maxWidth: 150, overflow: "auto" }}>
                <Box sx={{ maxHeight: 100, overflow: "auto" }}>
                  {new Date(row.time_created).toLocaleString()}
                </Box>
              </TableCell>
              <TableCell sx={{ maxWidth: 50, overflow: "auto" }}>
                <Box sx={{ maxWidth: 100, maxHeight: 100, overflow: "auto" }}>
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
                    sx={{
                      minWidth: 0,
                      padding: "4px 8px",
                      fontSize: "0.625rem",
                    }}
                  >
                    Download
                  </Button>
                  <Button
                    onClick={() =>
                      onNavigate(row.elements, row.url, row.job_options)
                    }
                    size="small"
                    sx={{
                      minWidth: 0,
                      padding: "4px 8px",
                      fontSize: "0.625rem",
                    }}
                  >
                    Rerun
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
