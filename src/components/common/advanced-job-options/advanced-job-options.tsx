import { RawJobOptions } from "@/types";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Button, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { AdvancedJobOptionsDialog } from "./dialog/advanced-job-options-dialog";

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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<SettingsIcon />}
        sx={{
          textTransform: "none",
          borderRadius: 2,
          px: 2,
          py: 1,
          borderColor: "divider",
          color: "text.secondary",
          "&:hover": {
            borderColor: "primary.main",
            color: "primary.main",
            bgcolor: "action.hover",
          },
        }}
      >
        <Typography variant="body2">Advanced Options</Typography>
      </Button>

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
