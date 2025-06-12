import StarIcon from "@mui/icons-material/Star";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import router from "next/router";
import { Job } from "../../types";

interface stateProps {
  selectedJobs: Set<string>;
  filteredJobs: Job[];
}

interface Props {
  onSelectJob: (job: string) => void;
  onNavigate: (
    id: string,
    elements: Object[],
    url: string,
    options: any
  ) => void;
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
                onClick={() => {
                  if (row.agent_mode) {
                    router.push({
                      pathname: "/agent",
                      query: {
                        url: row.url,
                        prompt: row.prompt,
                        job_options: JSON.stringify(row.job_options),
                        id: row.id,
                      },
                    });
                  } else {
                    onNavigate(row.id, row.elements, row.url, row.job_options);
                  }
                }}
                size="small"
                sx={{
                  minWidth: 0,
                  padding: "4px 8px",
                  fontSize: "0.625rem",
                }}
              >
                Rerun
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
