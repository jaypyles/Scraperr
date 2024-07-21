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
    setRows([...rows, updatedRow]);
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
    <>
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
              sx={{
                height: "40px",
                width: "40px",
              }}
              disabled={!(newRow.xpath.length > 0 && newRow.name.length > 0)}
            >
              <AddIcon
                fontSize="inherit"
                sx={{
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              />
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
    </>
  );
};
