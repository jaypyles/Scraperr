import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";

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

type Result = {
  [key: string]: ScrapeResult[];
};

const Home = () => {
  const { user } = useAuth0();
  const router = useRouter();

  const { elements, url } = router.query;

  const [submittedURL, setUrl] = useState("");
  const [rows, setRows] = useState<Element[]>([]);
  const [results, setResults] = useState<null | Result>(null);
  const [newRow, setNewRow] = useState<Element>({
    name: "",
    xpath: "",
    url: "",
  });

  useEffect(() => {
    if (elements) {
      setRows(JSON.parse(elements as string));
    }
    if (url) {
      setUrl(url as string);
    }
  }, [elements, url]);

  const handleAddRow = () => {
    newRow.url = submittedURL;
    setRows([...rows, newRow]);
    setNewRow({ name: "", xpath: "", url: "" });
  };

  const handleSubmit = () => {
    fetch("/api/submit-scrape-job", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: url,
        elements: rows,
        user: user?.name,
        time_created: new Date().toISOString(),
      }),
    })
      .then((response) => response.json())
      .then((data) => setResults(data));
  };

  return (
    <>
      <Container maxWidth="md">
        <Typography variant="h1" gutterBottom>
          Web Scraper
        </Typography>
        <div style={{ marginBottom: "20px" }}>
          <TextField
            label="URL"
            variant="outlined"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
        <Box display="flex" gap={2} marginBottom={2}>
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
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
          >
            Add Elements
          </Button>
        </Box>
        <Typography variant="h4">Elements</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>XPath</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField variant="outlined" fullWidth value={row.name} />
                </TableCell>
                <TableCell>
                  <TextField variant="outlined" fullWidth value={row.xpath} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {results && (
          <Table style={{ marginTop: "20px" }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>XPath</TableCell>
                <TableCell>Text</TableCell>
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
        )}
      </Container>
    </>
  );
};

export default Home;
