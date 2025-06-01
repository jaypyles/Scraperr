import { Box, Link, Typography } from "@mui/material";
import { SetStateAction, Dispatch, useState } from "react";
import { AdvancedJobOptionsDialog } from "./dialog/advanced-job-options-dialog";
import { RawJobOptions } from "@/types";

export type AdvancedJobOptionsProps = {
  jobOptions: RawJobOptions;
  setJobOptions: Dispatch<SetStateAction<RawJobOptions>>;
  multiPageScrapeEnabled?: boolean;
};

export const AdvancedJobOptions = ({
  jobOptions,
  setJobOptions,
  multiPageScrapeEnabled = true,
}: AdvancedJobOptionsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ mb: 2 }}>
      <Link
        component="button"
        variant="body2"
        onClick={() => setOpen(true)}
        sx={{
          textDecoration: "none",
          color: "primary.main",
          "&:hover": {
            color: "primary.dark",
            textDecoration: "underline",
          },
          paddingLeft: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Typography variant="body2">Advanced Job Options</Typography>
      </Link>

      <AdvancedJobOptionsDialog
        open={open}
        onClose={() => setOpen(false)}
        jobOptions={jobOptions}
        setJobOptions={setJobOptions}
        multiPageScrapeEnabled={multiPageScrapeEnabled}
      />
    </Box>
  );
};
