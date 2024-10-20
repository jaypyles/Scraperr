import React, { ReactNode } from "react";
import { Typography } from "@mui/material";
import classes from "./job-submitter-header.module.css";

interface JobSubmitterHeaderProps {
  title?: string;
  children?: ReactNode;
}

export const JobSubmitterHeader: React.FC<JobSubmitterHeaderProps> = ({
  title = "Scraping Made Easy",
  children,
}) => {
  return (
    <div className={classes.jobSubmitterHeader}>
      <Typography variant="h3">{title}</Typography>
      {children}
    </div>
  );
};
