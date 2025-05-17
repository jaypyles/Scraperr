import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";

export type CsvRow = {
  [key: string]: string;
};

export type CsvTableProps = {
  csv: {
    rows: CsvRow[];
    headers: string[];
  };
  className?: string;
};

export const CsvTable: React.FC<CsvTableProps> = ({ csv, className }) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const theme = useTheme();

  const handleRowClick = (rowIndex: number) => {
    setExpandedRow((prevRow) => (prevRow === rowIndex ? null : rowIndex));
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        width: "100%",
      }}
      className={className}
    >
      {csv.rows.length > 0 ? (
        <TableContainer
          sx={{
            flex: 1,
            overflow: "auto",
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[1],
          }}
        >
          <Table stickyHeader size="small" aria-label="csv data table">
            <TableHead>
              <TableRow>
                {csv.headers.map((header, idx) => (
                  <TableCell
                    key={idx}
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                      p: { xs: 1, sm: 2 },
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {csv.rows.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <TableRow
                    onClick={() => handleRowClick(rowIndex)}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.02
                        ),
                      },
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      },
                      cursor: "pointer",
                    }}
                  >
                    {Object.values(row).map((col, colIndex) => (
                      <TableCell
                        key={colIndex}
                        sx={{
                          whiteSpace: "nowrap",
                          maxWidth: { xs: "150px", sm: "200px", md: "200px" },
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          p: { xs: 1, sm: 2 },
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>

                  {expandedRow === rowIndex && (
                    <TableRow>
                      <TableCell
                        colSpan={csv.headers.length}
                        sx={{ padding: 2 }}
                      >
                        <Paper
                          sx={{
                            padding: 2,
                            backgroundColor: alpha(
                              theme.palette.background.paper,
                              0.5
                            ),
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {row.text
                              ? row.text
                                  .replace(/[\n\t\r]+/g, " ")
                                  .replace(/\s+/g, " ")
                                  .trim()
                              : "No text available"}
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper
          sx={{
            p: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            borderRadius: theme.shape.borderRadius,
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Typography color="text.secondary">No data available</Typography>
        </Paper>
      )}
    </Box>
  );
};
