import { useDownloadJob } from "@/hooks/use-download-job";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

export type JobDownloadDialogProps = {
  open: boolean;
  onClose: () => void;
  ids: string[];
};

export const JobDownloadDialog = ({
  open,
  onClose,
  ids,
}: JobDownloadDialogProps) => {
  const [jobFormat, setJobFormat] = useState<string>("csv");
  const { downloadJob } = useDownloadJob();

  const handleDownload = () => {
    downloadJob(ids, jobFormat);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Download Job</DialogTitle>
      <DialogContent>
        <FormControl>
          <Typography variant="body1">
            You are about to download {ids.length} job(s). Please select the
            format that you would like to download them in.
          </Typography>
          <br />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "background.paper",
              padding: 2,
              border: "1px solid",
            }}
          >
            <FormLabel>Format</FormLabel>
            <hr style={{ width: "100%", margin: "10px 0" }} />
            <RadioGroup
              aria-labelledby="job-download-format-radio-buttons"
              name="job-download-format-radio-buttons"
              value={jobFormat}
              onChange={(e) => setJobFormat(e.target.value)}
            >
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel
                value="md"
                control={<Radio />}
                label="Markdown"
              />
            </RadioGroup>
          </Box>
          <br />
          <Button onClick={handleDownload} size="small">
            Download
          </Button>
        </FormControl>
      </DialogContent>
    </Dialog>
  );
};
