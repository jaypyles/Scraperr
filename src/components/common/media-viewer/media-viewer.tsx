import { Box, Typography } from "@mui/material";
import { ImageViewer } from "./image";
import { VideoViewer } from "./video";
import { AudioViewer } from "./audio";
import { PDFViewer } from "./pdf-viewer";

interface MediaViewerProps {
  selectedMedia: string;
  activeTab: string;
  getMediaUrl: (fileName: string) => string;
  onError: (error: string) => void;
}

export const MediaViewer = ({
  selectedMedia,
  activeTab,
  getMediaUrl,
  onError,
}: MediaViewerProps) => {
  if (!selectedMedia) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography variant="body1" color="textSecondary">
          Select a file to view
        </Typography>
      </Box>
    );
  }

  const mediaUrl = getMediaUrl(selectedMedia);

  switch (activeTab) {
    case "images":
      return <ImageViewer mediaUrl={mediaUrl} selectedMedia={selectedMedia} />;
    case "videos":
      return (
        <VideoViewer
          mediaUrl={mediaUrl}
          onError={() => onError("Error loading video")}
        />
      );
    case "audio":
      return (
        <AudioViewer
          mediaUrl={mediaUrl}
          selectedMedia={selectedMedia}
          onError={() => onError("Error loading audio")}
        />
      );
    case "pdfs":
      return <PDFViewer mediaUrl={mediaUrl} selectedMedia={selectedMedia} />;
    default:
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body1">
            {selectedMedia} - Download this file to view it
          </Typography>
        </Box>
      );
  }
};
