import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Element {
  name: string;
  xpath: string;
  url: string;
}

interface ScrapeResult {
  xpath: string;
  text: string;
  name: string;
}

interface JobOptions {
  multi_page_scrape: boolean;
  custom_headers: null | Object;
}

type Result = {
  [key: string]: ScrapeResult[];
};

function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const { elements, url } = router.query;

  const [submittedURL, setSubmittedURL] = useState("");
  const [isValidURL, setIsValidUrl] = useState<boolean>(true);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [rows, setRows] = useState<Element[]>([]);
  const [results, setResults] = useState<null | Result>(null);
  const [newRow, setNewRow] = useState<Element>({
    name: "",
    xpath: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [jobOptions, setJobOptions] = useState<JobOptions>({
    multi_page_scrape: false,
    custom_headers: null,
  });

  const resultsRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    if (elements) {
      setRows(JSON.parse(elements as string));
    }
    if (url) {
      setSubmittedURL(url as string);
    }
  }, [elements, url]);

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  const handleAddRow = () => {
    const updatedRow = { ...newRow, url: submittedURL };
    setRows([...rows, updatedRow]);
    setNewRow({ name: "", xpath: "", url: "" });
  };

  const handleDeleteRow = (elementName: string) => {
    setRows(
      rows.filter((r) => {
        return elementName !== r.name;
      }),
    );
  };

  const handleSubmit = () => {
    if (!validateURL(submittedURL)) {
      setIsValidUrl(false);
      setUrlError("Please enter a valid URL.");
      return;
    }

    setIsValidUrl(true);
    setUrlError(null);
    setLoading(true);

    fetch("/api/submit-scrape-job", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: submittedURL,
        elements: rows,
        user: user?.email,
        time_created: new Date().toISOString(),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error);
          });
        }
        return response.json();
      })
      .then((data) => setResults(data))
      .catch((error) => {
        setSnackbarMessage(error.message || "An error occurred.");
        setSnackbarOpen(true);
      })
      .finally(() => setLoading(false));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      bgcolor="background.default"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      py={4}
    >
      <Container maxWidth="md">
        <Typography variant="h1" gutterBottom textAlign="center">
          Scraperr
        </Typography>
        <div className="flex flex-row space-x-4 items-center mb-2">
          <TextField
            label="URL"
            variant="outlined"
            fullWidth
            value={submittedURL}
            onChange={(e) => setSubmittedURL(e.target.value)}
            error={!isValidURL}
            helperText={!isValidURL ? urlError : ""}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSubmit}
            disabled={!(rows.length > 0) || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </div>
        <Box
          bgcolor="background.paper"
          className="p-2 mb-2 flex flex-row space-x-2"
        >
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
          <Accordion style={{ padding: 1 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Custom Headers (JSON)
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                InputLabelProps={{ shrink: false }}
                fullWidth
                multiline
                minRows={4}
                variant="outlined"
                value={jobOptions.custom_headers}
                onChange={(e) =>
                  setJobOptions((prevJobOptions) => ({
                    ...prevJobOptions,
                    custom_headers: e.target.value,
                  }))
                }
                style={{ maxHeight: "20vh", overflow: "auto" }}
                className="mt-2"
              />
            </AccordionDetails>
          </Accordion>
        </Box>
        <Box display="flex" gap={2} marginBottom={2} className="items-center">
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={newRow.name}
            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
          />
          <TextField
            label="XPath"
            variant="outlined"
            fullWidth
            value={newRow.xpath}
            onChange={(e) => setNewRow({ ...newRow, xpath: e.target.value })}
          />
          <Tooltip
            title={
              newRow.xpath.length > 0 && newRow.name.length > 0
                ? "Add Element"
                : "Fill out all fields to add an element"
            }
            placement="top"
          >
            <span>
              <IconButton
                aria-label="add"
                size="small"
                onClick={handleAddRow}
                sx={{ height: "40px", width: "40px" }}
                disabled={!(newRow.xpath.length > 0 && newRow.name.length > 0)}
              >
                <AddIcon fontSize="inherit" sx={{ color: "black" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Typography variant="h4">Elements</Typography>
        <TableContainer
          component={Box}
          sx={{ maxHeight: "50%", overflow: "auto" }}
        >
          <Table stickyHeader className="mb-4">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography sx={{ fontWeight: "bold" }}>Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: "bold" }}>XPath</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography>{row.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{row.xpath}</Typography>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleDeleteRow(row.name)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {results && (
          <>
            <Typography variant="h4">Results</Typography>
            <TableContainer
              component={Box}
              ref={resultsRef}
              sx={{ maxHeight: "50%", overflow: "auto", marginTop: "20px" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography sx={{ fontWeight: "bold" }}>Name</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: "bold" }}>XPath</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: "bold" }}>Text</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(results).map((key, index) => (
                    <React.Fragment key={index}>
                      {results[key].map((result, resultIndex) => (
                        <TableRow key={resultIndex}>
                          <TableCell>{result.name}</TableCell>
                          <TableCell>{result.xpath}</TableCell>
                          <TableCell>{result.text}</TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
