import { JobSelector } from "@/components/ai";
import { Job } from "@/types";
import {
  Box,
  useTheme,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { TileGridView } from "@/components/common/media-viewer/tile-grid-view";
import { MediaViewer } from "@/components/common/media-viewer";
import { useGetCurrentJobs } from "@/hooks/use-get-current-jobs";

export interface MediaFiles {
  audio: string[];
  documents: string[];
  images: string[];
  pdfs: string[];
  presentations: string[];
  spreadsheets: string[];
  videos: string[];
  [key: string]: string[];
}

export const MediaId = () => {
  const searchParams = useSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const { jobs, setJobs } = useGetCurrentJobs();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFiles | null>(null);
  const [activeTab, setActiveTab] = useState<string>("images");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const currentId = searchParams.get("id");
  const mediaType = searchParams.get("type") || "images";
  const mediaName = searchParams.get("file");

  const handleSelectJob = (job: Job | null) => {
    if (job) {
      router.push(`/media?id=${job.id}`);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    router.push(`/media?id=${currentId}&type=${newValue}`);
  };

  const handleMediaSelect = (fileName: string) => {
    setSelectedMedia(fileName);
    router.push(`/media?id=${currentId}&type=${activeTab}&file=${fileName}`);
  };

  // Set selected job when currentId changes
  useEffect(() => {
    if (!currentId) {
      setSelectedJob(null);
      return;
    }

    const job = jobs.find((j) => j.id === currentId);
    setSelectedJob(job || null);
  }, [currentId, jobs]);

  // Fetch media files when selected job changes
  useEffect(() => {
    if (!selectedJob?.id) {
      setError("No job ID provided");
      setLoading(false);
      return;
    }

    const fetchMediaFiles = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/media/get-media?id=${selectedJob.id}`);

        if (!res.ok) {
          throw new Error(`Media not found (status: ${res.status})`);
        }

        const data = await res.json();
        setMediaFiles(data.files);

        const hasMediaType = mediaType && data.files[mediaType]?.length > 0;

        if (hasMediaType && activeTab !== mediaType) {
          setActiveTab(mediaType);
        } else if (!hasMediaType && !activeTab) {
          // Only set a default tab if activeTab is not set
          const firstNonEmpty = Object.entries(data.files).find(
            ([_, files]) => Array.isArray(files) && files.length > 0
          );
          if (firstNonEmpty) {
            setActiveTab(firstNonEmpty[0]);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch media files"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMediaFiles();
  }, [selectedJob?.id]);

  // Set selected media when mediaName changes
  useEffect(() => {
    if (mediaName && mediaName !== selectedMedia) {
      setSelectedMedia(mediaName);
    }
  }, [mediaName, selectedMedia]);

  // Get media file URL
  const getMediaUrl = (fileName: string) => {
    if (!currentId || !activeTab) return "";
    return `/api/media?id=${currentId}&type=${activeTab}&file=${fileName}`;
  };

  const renderMediaThumbnails = () => {
    if (
      !mediaFiles ||
      !mediaFiles[activeTab] ||
      mediaFiles[activeTab].length === 0
    ) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            p: 3,
          }}
        >
          <Typography variant="body2" color="textSecondary">
            No {activeTab} files available
          </Typography>
        </Box>
      );
    }

    return (
      <TileGridView
        mediaFiles={mediaFiles}
        activeTab={activeTab}
        selectedMedia={selectedMedia || ""}
        handleMediaSelect={handleMediaSelect}
        getMediaUrl={getMediaUrl}
      />
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === "light"
              ? theme.palette.grey[50]
              : theme.palette.grey[900],
          zIndex: 10,
        }}
      >
        <Box sx={{ width: "300px" }}>
          <JobSelector
            setSelectedJob={handleSelectJob}
            selectedJob={selectedJob}
            setJobs={setJobs}
            jobs={jobs}
          />
        </Box>
      </Box>

      {loading ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ flex: 1 }}
          gap={2}
        >
          <CircularProgress />
          <Typography variant="body2" color="textSecondary">
            Loading media...
          </Typography>
        </Box>
      ) : error ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            p: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              maxWidth: "500px",
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
            }}
          >
            <Alert
              severity="error"
              variant="filled"
              sx={{
                mb: 2,
                backgroundColor: theme.palette.error.main,
              }}
            >
              {error}
            </Alert>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Please select a different job from the dropdown menu above or
              check if media browsing is enabled.
            </Typography>
          </Paper>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.grey[50]
                  : theme.palette.grey[900],
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="media type tabs"
            >
              {mediaFiles &&
                Object.entries(mediaFiles).map(([type, files]) => (
                  <Tab
                    key={type}
                    value={type}
                    label={`${type.charAt(0).toUpperCase() + type.slice(1)} (${
                      files.length
                    })`}
                    disabled={!files.length}
                  />
                ))}
            </Tabs>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              height: "calc(100% - 48px)",
              overflow: "hidden",
            }}
          >
            {selectedMedia && mediaType && mediaName ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? theme.palette.grey[50]
                        : theme.palette.grey[900],
                  }}
                >
                  <Typography variant="subtitle1" noWrap>
                    {selectedMedia}
                  </Typography>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        cursor: "pointer",
                        color: theme.palette.primary.main,
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                      onClick={async () => {
                        setSelectedMedia(null);
                        await router.push(
                          `/media?id=${currentId}&type=${mediaType}`
                        );
                      }}
                    >
                      Back to Gallery
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? theme.palette.grey[100]
                        : theme.palette.grey[900],
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 2,
                  }}
                >
                  <MediaViewer
                    selectedMedia={selectedMedia}
                    activeTab={activeTab}
                    getMediaUrl={getMediaUrl}
                    onError={() => setError("Error loading media")}
                  />
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? theme.palette.grey[100]
                      : theme.palette.grey[900],
                }}
              >
                {renderMediaThumbnails()}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
