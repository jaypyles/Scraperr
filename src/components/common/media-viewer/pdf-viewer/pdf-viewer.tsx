import { Box, useTheme } from "@mui/material";

interface PDFViewerProps {
  mediaUrl: string;
  selectedMedia: string;
}

export const PDFViewer = ({ mediaUrl, selectedMedia }: PDFViewerProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 1,
      }}
    >
      <iframe
        src={`${mediaUrl}#view=fitH`}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "4px",
          boxShadow: theme.shadows[4],
        }}
        title={selectedMedia}
      />
    </Box>
  );
};
