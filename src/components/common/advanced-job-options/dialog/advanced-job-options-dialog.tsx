import { ExpandedTableInput } from "@/components/common/expanded-table-input";
import { UploadFile } from "@/components/common/upload-file";
import { useImportJobConfig } from "@/hooks/use-import-job-config";
import { RawJobOptions } from "@/types";
import {
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  InfoOutlined,
  Settings,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";

export type AdvancedJobOptionsDialogProps = {
  open: boolean;
  onClose: () => void;
  jobOptions: RawJobOptions;
  setJobOptions: Dispatch<SetStateAction<RawJobOptions>>;
  multiPageScrapeEnabled?: boolean;
};

export const AdvancedJobOptionsDialog = ({
  open,
  onClose,
  jobOptions,
  setJobOptions,
  multiPageScrapeEnabled = true,
}: AdvancedJobOptionsDialogProps) => {
  const theme = useTheme();
  const { handleUploadFile } = useImportJobConfig();
  const [localJobOptions, setLocalJobOptions] =
    useState<RawJobOptions>(jobOptions);

  useEffect(() => {
    setLocalJobOptions(jobOptions);
  }, [jobOptions]);

  const handleCheckboxChange = (key: keyof RawJobOptions) => {
    setLocalJobOptions((prevJobOptions) => ({
      ...prevJobOptions,
      [key]: !prevJobOptions[key],
    }));
  };

  const handleProxiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalJobOptions((prevJobOptions) => ({
      ...prevJobOptions,
      proxies: e.target.value,
    }));
  };

  const handleClose = () => {
    setJobOptions(localJobOptions);
    onClose();
  };

  const onUploadFile = async (file: File) => {
    const errorOccured = await handleUploadFile(file);
    if (errorOccured) {
      handleClose();
      toast.error("Failed to upload job config");
      return;
    } else {
      handleClose();
      toast.success("Job config uploaded successfully");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.primary.contrastText,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          marginRight: 2,
          marginLeft: 2,
        }}
      >
        <Typography variant="h6" component="div">
          Advanced Job Options
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UploadFile
            message="Upload Job Config"
            fileTypes={["application/json"]}
            onUploadFile={onUploadFile}
          />
          <Settings
            sx={{
              color: theme.palette.primary.contrastText,
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{ padding: 3, overflowY: "auto", marginTop: 2, height: "60rem" }}
      >
        <FormControl fullWidth>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                fontWeight: "bold",
                color: theme.palette.text.primary,
              }}
            >
              Collection Options
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.palette.divider }} />

            <FormGroup row sx={{ gap: 4, mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localJobOptions.multi_page_scrape}
                    onChange={() => handleCheckboxChange("multi_page_scrape")}
                    disabled={!multiPageScrapeEnabled}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography>Multi Page Scrape</Typography>
                    <Tooltip
                      title={
                        multiPageScrapeEnabled
                          ? "Enable crawling through multiple pages"
                          : "Multi page scrape is disabled"
                      }
                    >
                      <IconButton size="small">
                        <InfoOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={localJobOptions.collect_media}
                    onChange={() => handleCheckboxChange("collect_media")}
                    data-cy="collect-media-checkbox"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography>Collect Media</Typography>
                    <Tooltip title="Download images and other media">
                      <IconButton size="small">
                        <InfoOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={localJobOptions.return_html}
                    onChange={() => handleCheckboxChange("return_html")}
                    data-cy="return-html-checkbox"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography>Return HTML</Typography>
                    <Tooltip title="Return the HTML of the page">
                      <IconButton size="small">
                        <InfoOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </FormGroup>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                fontWeight: "bold",
                color: theme.palette.text.primary,
              }}
            >
              Custom Options
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.palette.divider }} />

            {/* Proxies Section */}
            <Accordion
              defaultExpanded
              elevation={0}
              sx={{
                mb: 2,
                border: `1px solid ${theme.palette.divider}`,
                "&:before": { display: "none" },
                borderRadius: 1,
                overflow: "hidden",
                padding: 1,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "&.Mui-expanded": {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                      }}
                    >
                      Proxies
                    </Typography>

                    <Tooltip title="Comma separated list of proxies that should follow Playwright proxy format">
                      <InfoOutlined fontSize="small" />
                    </Tooltip>
                  </div>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{ p: 2, backgroundColor: theme.palette.background.default }}
              >
                <TextField
                  placeholder='Proxies ([{"server": "proxy.example.com:8080", "username": "username", "password": "password"}])'
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={localJobOptions.proxies}
                  onChange={handleProxiesChange}
                  InputProps={{
                    startAdornment: (
                      <CodeIcon
                        sx={{ color: theme.palette.text.secondary, mr: 1 }}
                      />
                    ),
                  }}
                />
              </AccordionDetails>
            </Accordion>

            {/* Custom Headers Section */}
            <ExpandedTableInput
              label="Custom Headers"
              placeholder='{"User-Agent": "CustomAgent", "Accept": "*/*"}'
              urlParam="custom_headers"
              name="custom_headers"
              onChange={(value) => {
                setLocalJobOptions((prevJobOptions) => ({
                  ...prevJobOptions,
                  custom_headers: value,
                }));
              }}
            />

            {/* Custom Cookies Section */}
            <ExpandedTableInput
              label="Custom Cookies"
              placeholder='[{"name": "value", "name2": "value2"}]'
              urlParam="custom_cookies"
              name="custom_cookies"
              onChange={(value) => {
                setLocalJobOptions((prevJobOptions) => ({
                  ...prevJobOptions,
                  custom_cookies: value,
                }));
              }}
            />
          </Box>
        </FormControl>
      </DialogContent>
    </Dialog>
  );
};
