"use client";

import { Element } from "@/types";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { SiteMap } from "../site-map";

interface Props {
  rows: Element[];
  setRows: Dispatch<SetStateAction<Element[]>>;
  submittedURL: string;
}

export const ElementTable = ({ rows, setRows, submittedURL }: Props) => {
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
    setRows(rows.filter((r) => elementName !== r.name));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        },
      }}
    >
      <Box className="flex flex-col gap-6">
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 1,
            }}
          >
            Elements to Scrape
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Add elements to scrape from the target URL using XPath selectors
          </Typography>
        </Box>

        <TableContainer
          component={Box}
          sx={{
            maxHeight: "400px",
            overflow: "auto",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              "& .MuiTableCell-root": {
                borderBottom: "1px solid",
                borderColor: "divider",
                py: 1.5,
              },
              "& .MuiTableCell-head": {
                bgcolor: "background.default",
                fontWeight: 600,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell width="30%">Name</TableCell>
                <TableCell width="50%">XPath</TableCell>
                <TableCell width="20%" align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <TextField
                    data-cy="name-field"
                    placeholder="Enter element name"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={newRow.name}
                    onChange={(e) =>
                      setNewRow({ ...newRow, name: e.target.value })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "background.default",
                        "&:hover": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                          },
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    data-cy="xpath-field"
                    placeholder="Enter XPath selector"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={newRow.xpath}
                    onChange={(e) =>
                      setNewRow({ ...newRow, xpath: e.target.value })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "background.default",
                        "&:hover": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                          },
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="center">
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
                        disabled={
                          !(newRow.xpath.length > 0 && newRow.name.length > 0)
                        }
                        sx={{
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: "primary.dark",
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-disabled": {
                            bgcolor: "action.disabledBackground",
                            color: "action.disabled",
                          },
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
              {rows.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        color: "text.secondary",
                      }}
                      noWrap
                    >
                      {row.xpath}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleDeleteRow(row.name)}
                      size="small"
                      color="error"
                      sx={{
                        "&:hover": {
                          bgcolor: "error.main",
                          color: "error.contrastText",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />
        <SiteMap />
      </Box>
    </Paper>
  );
};
