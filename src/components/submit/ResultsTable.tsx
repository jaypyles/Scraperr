import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import { Result } from "../../types";

interface stateProps {
  results: Result;
}

interface Props {
  stateProps: stateProps;
  resultsRef: React.MutableRefObject<HTMLElement | null>;
}

export const ResultsTable = ({ stateProps, resultsRef }: Props) => {
  const { results } = stateProps;

  return (
    <>
      {Object.keys(results).length ? (
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
      ) : null}
    </>
  );
};
