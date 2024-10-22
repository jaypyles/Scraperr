"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import {
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Box,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Element } from "../../types";

interface Props {
  rows: Element[];
  setRows: Dispatch<SetStateAction<Element[]>>;
  submittedURL: string;
}

export const ElementTable = ({ rows, setRows, submittedURL }: Props) => {
  const theme = useTheme();
  const [newRow, setNewRow] = useState<Element>({
    name: "",
    xpath: "",
    url: "",
  });

  const handleAddRow = () => {
    const updatedRow = { ...newRow, url: submittedURL };
    setRows([updatedRow, ...rows]);
    setNewRow({ name: "", xpath: "", url: "" });
  };

  const handleDeleteRow = (elementName: string) => {
    setRows(
      rows.filter((r) => {
        return elementName !== r.name;
      })
    );
  };

  return (
    <Box className="animate-fadeIn p-2" bgcolor="background.paper">
      <Box className="text-center mb-4">
        <Typography variant="h4" sx={{ marginBottom: 1 }}>
          Elements to Scrape
        </Typography>
        <TableContainer
          component={Box}
          sx={{ maxHeight: "50%", overflow: "auto" }}
        >
          <div className="rounded-lg shadow-md border border-gray-300 overflow-hidden">
            <Table
              stickyHeader
              className="mb-4"
              sx={{
                tableLayout: "fixed",
                width: "100%",
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid #e0e0e0",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography sx={{ fontWeight: "bold" }}>Name</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: "bold" }}>XPath</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: "bold" }}>Actions</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <TextField
                      data-cy="name-field"
                      label="Name"
                      variant="outlined"
                      fullWidth
                      value={newRow.name}
                      onChange={(e) =>
                        setNewRow({ ...newRow, name: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      data-cy="xpath-field"
                      label="XPath"
                      variant="outlined"
                      fullWidth
                      value={newRow.xpath}
                      onChange={(e) =>
                        setNewRow({ ...newRow, xpath: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
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
                          data-cy="add-button"
                          aria-label="add"
                          size="small"
                          onClick={handleAddRow}
                          sx={{
                            height: "40px",
                            width: "40px",
                          }}
                          disabled={
                            !(newRow.xpath.length > 0 && newRow.name.length > 0)
                          }
                        >
                          <AddIcon
                            fontSize="inherit"
                            sx={{
                              color:
                                theme.palette.mode === "light"
                                  ? "#000000"
                                  : "#ffffff",
                            }}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography>{row.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{row.xpath}</Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDeleteRow(row.name)}
                        className="!bg-red-500 bg-opacity-50 !text-white font-semibold rounded-md 
                        transition-transform transform hover:scale-105 hover:bg-red-500"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
      </Box>
    </Box>
  );
};
