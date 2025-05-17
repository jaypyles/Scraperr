import { Box, useTheme } from "@mui/material";

export const VideoViewer = ({
  mediaUrl,
  onError,
}: {
  mediaUrl: string;
  onError: () => void;
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: 1,
      }}
    >
      <video
        className="h-full w-full object-contain"
        controls
        onError={onError}
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          borderRadius: "4px",
          boxShadow: theme.shadows[4],
        }}
      >
        <source src={mediaUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </Box>
  );
};
