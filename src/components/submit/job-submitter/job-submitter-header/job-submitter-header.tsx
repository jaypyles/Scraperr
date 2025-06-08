import { Box, Typography } from "@mui/material";
import React, { ReactNode } from "react";
import styles from "./job-submitter-header.module.css";

interface JobSubmitterHeaderProps {
  title?: string;
  children?: ReactNode;
}

export const JobSubmitterHeader: React.FC<JobSubmitterHeaderProps> = ({
  title = "Scrape Webpage",
  children,
}) => {
  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        {title}
      </Typography>
      {children}
    </Box>
  );
};
