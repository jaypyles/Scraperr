import { Box, FormControlLabel, Checkbox, TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import { JobOptions } from "@/types/job";

export type JobSubmitterOptionsProps = {
  jobOptions: JobOptions;
  setJobOptions: Dispatch<SetStateAction<JobOptions>>;
  customJSONSelected: boolean;
  setCustomJSONSelected: Dispatch<SetStateAction<boolean>>;
};

export const JobSubmitterOptions = ({
  jobOptions,
  setJobOptions,
  customJSONSelected,
  setCustomJSONSelected,
}: JobSubmitterOptionsProps) => {
  return (
    <Box bgcolor="background.paper" className="flex flex-col mb-2 rounded-md">
      <div id="options" className="p-2 flex flex-row space-x-2">
        <FormControlLabel
          label="Multi-Page Scrape"
          control={
            <Checkbox
              checked={jobOptions.multi_page_scrape}
              onChange={() =>
                setJobOptions((prevJobOptions) => ({
                  ...prevJobOptions,
                  multi_page_scrape: !prevJobOptions.multi_page_scrape,
                }))
              }
            />
          }
        ></FormControlLabel>
        <FormControlLabel
          label="Custom Headers (JSON)"
          control={
            <Checkbox
              checked={customJSONSelected}
              onChange={() => {
                setCustomJSONSelected(!customJSONSelected);
                setJobOptions((prevJobOptions) => ({
                  ...prevJobOptions,
                  custom_headers: "",
                }));
              }}
            />
          }
        ></FormControlLabel>
      </div>
      {customJSONSelected ? (
        <div id="custom-json" className="pl-2 pr-2 pb-2">
          <TextField
            InputLabelProps={{ shrink: false }}
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            value={jobOptions.custom_headers || ""}
            onChange={(e) =>
              setJobOptions((prevJobOptions) => ({
                ...prevJobOptions,
                custom_headers: e.target.value,
              }))
            }
            style={{ maxHeight: "20vh", overflow: "auto" }}
            className="mt-2"
          />
        </div>
      ) : null}
    </Box>
  );
};
