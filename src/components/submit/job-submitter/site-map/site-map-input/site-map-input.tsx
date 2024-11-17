import { useState } from "react";
import { useJobSubmitterProvider } from "../../provider";
import {
  MenuItem,
  Select,
  TextField,
  FormControl,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { ActionOption } from "@/types/job";
import classes from "./site-map-input.module.css";
import { clsx } from "clsx";

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
  console.log(clickOnce);
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

    console.log(optionState, xpathState, clickOnceState, inputState);

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
  };

  const handleRemove = () => {
    if (!siteMap) return;

    setSiteMap((prevSiteMap) => ({
      ...prevSiteMap,
      actions: (prevSiteMap?.actions || []).slice(0, -1),
    }));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2 items-center">
        <FormControl className="w-1/4">
          <Select
            disabled={disabled}
            displayEmpty
            value={optionState}
            onChange={(e) => setOptionState(e.target.value as ActionOption)}
          >
            <MenuItem value="click">Click</MenuItem>
            <MenuItem value="input">Input</MenuItem>
          </Select>
        </FormControl>
        {optionState === "input" && (
          <TextField
            label="Input Text"
            fullWidth
            value={inputState}
            onChange={(e) => setInputState(e.target.value)}
            disabled={disabled}
          />
        )}
        <TextField
          label="XPath Selector"
          fullWidth
          value={xpathState}
          onChange={(e) => setXpathState(e.target.value)}
          disabled={disabled}
        />
        {disabled ? (
          <Button
            onClick={handleRemove}
            className={clsx(classes.button, classes.remove)}
          >
            Delete
          </Button>
        ) : (
          <Button
            onClick={handleAdd}
            disabled={!xpathState}
            className={clsx(classes.button, classes.add)}
          >
            Add
          </Button>
        )}
      </div>
      {!disabled && (
        <FormControlLabel
          label="Do Once"
          control={
            <Checkbox
              checked={clickOnceState}
              disabled={disabled}
              onChange={() => setClickOnceState(!clickOnceState)}
            />
          }
        />
      )}
    </div>
  );
};
