import { Box, Typography } from "@mui/material";
import React, { ReactNode } from "react";

interface JobSubmitterHeaderProps {
  title?: string;
  children?: ReactNode;
}

export const JobSubmitterHeader: React.FC<JobSubmitterHeaderProps> = ({
  title = "Scrape Webpage",
  children,
}) => {
  return (
    <Box
      sx={{
        textAlign: "left",
        mb: 1,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          mb: 1,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};
