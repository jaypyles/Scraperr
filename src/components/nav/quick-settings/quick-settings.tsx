import React from "react";

import classes from "./quick-settings.module.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Switch,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

type QuickSettingsProps = {
  toggleTheme: () => void;
  isDarkMode: boolean;
};

export const QuickSettings: React.FC<QuickSettingsProps> = ({
  toggleTheme,
  isDarkMode,
}) => {
  return (
    <Accordion className={classes.quickSettings}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>Quick Settings</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div className={classes.details}>
          <Typography className={classes.detailsText} component="span">
            <p className={classes.detailsText}>Dark Theme Toggle</p>
          </Typography>
          <Switch checked={isDarkMode} onChange={toggleTheme} />
        </div>
      </AccordionDetails>
    </Accordion>
  );
};
