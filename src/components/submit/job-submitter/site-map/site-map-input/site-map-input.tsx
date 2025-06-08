import { ActionOption } from "@/types/job";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useJobSubmitterProvider } from "../../provider";

export type SiteMapInputProps = {
  disabled?: boolean;
  xpath?: string;
  option?: ActionOption;
  clickOnce?: boolean;
  input?: string;
};

export const SiteMapInput = ({
  disabled,
  xpath,
  option,
  clickOnce,
  input,
}: SiteMapInputProps) => {
  const [optionState, setOptionState] = useState<ActionOption>(
    option || "click"
  );
  const [xpathState, setXpathState] = useState<string>(xpath || "");
  const [clickOnceState, setClickOnceState] = useState<boolean>(
    clickOnce || false
  );
  const [inputState, setInputState] = useState<string>(input || "");

  const { siteMap, setSiteMap } = useJobSubmitterProvider();

  const handleAdd = () => {
    if (!siteMap) return;

    setSiteMap((prevSiteMap) => ({
      ...prevSiteMap,
      actions: [
        {
          type: optionState,
          xpath: xpathState,
          name: "",
          do_once: clickOnceState,
          input: inputState,
        },
        ...(prevSiteMap?.actions || []),
      ],
    }));

    setXpathState("");
    setInputState("");
  };

  const handleRemove = () => {
    if (!siteMap) return;

    setSiteMap((prevSiteMap) => ({
      ...prevSiteMap,
      actions: (prevSiteMap?.actions || []).slice(0, -1),
    }));
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Action Type</InputLabel>
          <Select
            disabled={disabled}
            value={optionState}
            label="Action Type"
            onChange={(e) => setOptionState(e.target.value as ActionOption)}
            sx={{
              "& .MuiSelect-select": {
                textTransform: "capitalize",
              },
            }}
          >
            <MenuItem value="click">Click</MenuItem>
            <MenuItem value="input">Input</MenuItem>
          </Select>
        </FormControl>
        {optionState === "input" && (
          <TextField
            label="Input Text"
            size="small"
            fullWidth
            value={inputState}
            onChange={(e) => setInputState(e.target.value)}
            disabled={disabled}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.default",
              },
            }}
          />
        )}
        {!disabled && (
          <TextField
            label="XPath Selector"
            size="small"
            fullWidth
            value={xpathState}
            onChange={(e) => setXpathState(e.target.value)}
            disabled={disabled}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.default",
                fontFamily: "monospace",
                fontSize: "1rem",
              },
            }}
          />
        )}
        {disabled ? (
          <Button
            onClick={handleRemove}
            size="small"
            variant="outlined"
            color="error"
            sx={{
              minWidth: "80px",
              textTransform: "none",
              "&:hover": {
                bgcolor: "error.main",
                color: "error.contrastText",
              },
            }}
          >
            Delete
          </Button>
        ) : (
          <Button
            onClick={handleAdd}
            disabled={!xpathState}
            size="small"
            variant="contained"
            color="primary"
            sx={{
              minWidth: "80px",
              textTransform: "none",
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            Add
          </Button>
        )}
      </Box>
      {!disabled && (
        <FormControlLabel
          label="Do Once"
          control={
            <Checkbox
              size="small"
              checked={clickOnceState}
              disabled={disabled}
              onChange={() => setClickOnceState(!clickOnceState)}
            />
          }
          sx={{
            "& .MuiFormControlLabel-label": {
              fontSize: "0.875rem",
              color: "text.secondary",
            },
          }}
        />
      )}
    </Box>
  );
};
