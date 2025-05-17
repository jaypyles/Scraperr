import { Box, useTheme } from "@mui/material";

export const ImageViewer = ({
  mediaUrl,
  selectedMedia,
}: {
  mediaUrl: string;
  selectedMedia: string;
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <img
        src={mediaUrl}
        alt={selectedMedia}
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          objectFit: "contain",
          borderRadius: "4px",
          boxShadow: theme.shadows[4],
        }}
      />
    </Box>
  );
};
