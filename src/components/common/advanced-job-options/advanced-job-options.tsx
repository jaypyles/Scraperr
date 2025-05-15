import { Box, Link } from "@mui/material";
import { SetStateAction, Dispatch, useState } from "react";
import { AdvancedJobOptionsDialog } from "./dialog/advanced-job-options-dialog";
import { RawJobOptions } from "@/types";

export type AdvancedJobOptionsProps = {
  jobOptions: RawJobOptions;
  setJobOptions: Dispatch<SetStateAction<RawJobOptions>>;
};

export const AdvancedJobOptions = ({
  jobOptions,
  setJobOptions,
}: AdvancedJobOptionsProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ mb: 2 }}>
      <Link className="cursor-pointer" onClick={() => setOpen(true)}>
        Advanced Job Options
      </Link>
      <AdvancedJobOptionsDialog
        open={open}
        onClose={() => setOpen(false)}
        jobOptions={jobOptions}
        setJobOptions={setJobOptions}
      />
    </Box>
  );
};
