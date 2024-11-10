import { RawJobOptions } from "@/types/job";
import { Box, FormControlLabel, Checkbox, TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

export type JobSubmitterOptionsProps = {
  jobOptions: RawJobOptions;
  setJobOptions: Dispatch<SetStateAction<RawJobOptions>>;
  customJSONSelected: boolean;
  setCustomJSONSelected: Dispatch<SetStateAction<boolean>>;
  handleSelectProxies: () => void;
  proxiesSelected: boolean;
};

export const JobSubmitterOptions = ({
  jobOptions,
  setJobOptions,
  customJSONSelected,
  setCustomJSONSelected,
  handleSelectProxies,
  proxiesSelected,
}: JobSubmitterOptionsProps) => {
  const handleMultiPageScrapeChange = () => {
    setJobOptions((prevJobOptions) => ({
      ...prevJobOptions,
      multi_page_scrape: !prevJobOptions.multi_page_scrape,
    }));
  };

  const handleProxiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobOptions((prevJobOptions) => ({
      ...prevJobOptions,
      proxies: e.target.value,
    }));
  };

  const handleCustomHeadersChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setJobOptions((prevJobOptions) => ({
      ...prevJobOptions,
      custom_headers: e.target.value,
    }));
  };

  return (
    <Box bgcolor="background.paper" className="flex flex-col mb-2 rounded-md">
      <div id="options" className="p-2 flex flex-row space-x-2">
        <FormControlLabel
          label="Multi-Page Scrape"
          className="mr-0"
          control={
            <Checkbox
              checked={jobOptions.multi_page_scrape}
              onChange={handleMultiPageScrapeChange}
            />
          }
        ></FormControlLabel>
        <FormControlLabel
          label="Proxies"
          control={
            <Checkbox
              checked={proxiesSelected}
              onChange={handleSelectProxies}
            />
          }
        ></FormControlLabel>
        {proxiesSelected ? (
          <div id="proxies">
            <TextField
              InputLabelProps={{ shrink: false }}
              fullWidth
              multiline={false}
              variant="outlined"
              value={jobOptions.proxies || ""}
              onChange={handleProxiesChange}
              inputProps={{
                style: { whiteSpace: "nowrap", overflowX: "auto" },
              }}
            />
          </div>
        ) : null}
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
            onChange={handleCustomHeadersChange}
            style={{ maxHeight: "20vh", overflow: "auto" }}
          />
        </div>
      ) : null}
    </Box>
  );
};
