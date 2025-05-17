import { MediaFiles } from "@/components/pages/media/id/id";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
} from "@mui/material";

interface TileGridViewProps {
  mediaFiles: MediaFiles;
  activeTab: string;
  selectedMedia: string;
  handleMediaSelect: (fileName: string) => void;
  getMediaUrl: (fileName: string) => string;
}

export const TileGridView = ({
  mediaFiles,
  activeTab,
  selectedMedia,
  handleMediaSelect,
  getMediaUrl,
}: TileGridViewProps) => {
  const theme = useTheme();

  return (
    <Grid container spacing={2} sx={{ p: 2 }} data-testid="media-grid">
      {mediaFiles[activeTab].map((fileName: string) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={fileName}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderColor:
                selectedMedia === fileName
                  ? theme.palette.primary.main
                  : "transparent",
              borderWidth: 2,
              borderStyle: "solid",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[6],
              },
            }}
          >
            <CardActionArea onClick={() => handleMediaSelect(fileName)}>
              <CardMedia
                component="div"
                sx={{
                  pt: "75%",
                  position: "relative",
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? theme.palette.grey[100]
                      : theme.palette.grey[800],
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {activeTab === "images" ? (
                  <Box
                    component="img"
                    src={getMediaUrl(fileName)}
                    alt={fileName}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      p: 1,
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== "/placeholder-image.png") {
                        target.src = "";
                      }
                    }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {fileName.split(".").pop()?.toUpperCase() || "FILE"}
                  </Typography>
                )}
              </CardMedia>
              <CardContent sx={{ flexGrow: 1, p: 1 }}>
                <Typography variant="body2" noWrap title={fileName}>
                  {fileName}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
