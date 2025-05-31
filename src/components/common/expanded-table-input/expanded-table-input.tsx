import { parseJsonToEntries } from "@/lib/helpers/parse-json-to-entries";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

export type ExpandedTableInputProps = {
  label: string;
  onChange: (value: any) => void;
  placeholder: string;
  urlParam: string;
  name: string;
};

export const ExpandedTableInput = ({
  label,
  onChange,
  placeholder,
  urlParam,
  name,
}: ExpandedTableInputProps) => {
  const theme = useTheme();
  const [value, setValue] = useState("");
  const [parsedHeaders, setParsedHeaders] = useState<[string, string][] | null>(
    null
  );

  const [jsonError, setJsonError] = useState<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);

  const validateAndParse = (val: string) => {
    if (val.trim() === "") {
      setParsedHeaders(null);
      setJsonError(null);
      return null;
    }

    try {
      const parsed = JSON.parse(val);
      const entries = parseJsonToEntries(val);

      if (entries === null) {
        setParsedHeaders(null);
        setJsonError("Invalid JSON object");
        return null;
      } else {
        setParsedHeaders(entries);
        setJsonError(null);
        return parsed;
      }
    } catch (e) {
      setParsedHeaders(null);
      setJsonError("Invalid JSON format");
      return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    const parsed = validateAndParse(val);
    onChange(parsed);
  };

  useEffect(() => {
    const jobOptions = urlParams.get("job_options");

    if (!jobOptions) {
      setParsedHeaders(null);
      setJsonError(null);
      return;
    }

    const jobOptionsObject = JSON.parse(jobOptions || "{}");
    let val = jobOptionsObject[urlParam];

    if (val.length === 0 || Object.keys(val).length === 0) {
      setParsedHeaders(null);
      setJsonError(null);
      return;
    }

    if (typeof val === "string") {
      try {
        val = JSON.parse(val);
      } catch {}
    }

    const finalVal =
      typeof val === "string" ? val : val != null ? JSON.stringify(val) : "";

    setValue(finalVal);
    const parsed = validateAndParse(finalVal);
    onChange(parsed);
  }, [urlParam]);

  return (
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
          <Typography
            sx={{ fontWeight: 500, color: theme.palette.text.primary }}
          >
            {label}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails
        sx={{ p: 2, backgroundColor: theme.palette.background.default }}
      >
        <TextField
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size="small"
          error={jsonError !== null}
          helperText={jsonError ?? ""}
          name={name}
        />

        {parsedHeaders && parsedHeaders.length > 0 && (
          <Paper
            variant="outlined"
            sx={{
              marginTop: 1,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              overflow: "hidden",
              padding: 0,
            }}
          >
            <TableContainer sx={{ maxHeight: 200 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <TableCell sx={{ fontWeight: "bold" }}>Header</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedHeaders.map(([key, val]) => (
                    <TableRow
                      key={key}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor:
                            theme.palette.mode === "light"
                              ? "rgba(0, 0, 0, 0.02)"
                              : "rgba(255, 255, 255, 0.02)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{key}</TableCell>
                      <TableCell>{val}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
