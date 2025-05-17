
import { Box, Typography } from "@mui/material";

interface AudioViewerProps {
  mediaUrl: string;
  selectedMedia: string;
  onError: () => void;
}

export const AudioViewer = ({
  mediaUrl,
  selectedMedia,
  onError,
}: AudioViewerProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100%",
        gap: 2,
      }}
    >
      <Typography variant="h6">{selectedMedia}</Typography>
      <audio
        controls
        onError={onError}
        style={{
          width: "80%",
          maxWidth: "500px",
        }}
      >
        <source src={mediaUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </Box>
  );
};
