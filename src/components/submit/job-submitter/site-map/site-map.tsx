import {
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useJobSubmitterProvider } from "../provider";
import { SiteMapInput } from "./site-map-input";

export const SiteMap = () => {
  const { siteMap, setSiteMap } = useJobSubmitterProvider();
  const [showSiteMap, setShowSiteMap] = useState<boolean>(false);

  const handleCreateSiteMap = () => {
    setSiteMap({ actions: [] });
    setShowSiteMap(true);
  };

  const handleClearSiteMap = () => {
    setSiteMap(null);
    setShowSiteMap(false);
  };

  useEffect(() => {
    if (siteMap) {
      setShowSiteMap(true);
    }
  }, [siteMap]);

  return (
    <Box className="flex flex-col gap-4">
      {!siteMap ? (
        <Button
          onClick={handleCreateSiteMap}
          variant="contained"
          color="primary"
          sx={{
            alignSelf: "flex-end",
            textTransform: "none",
          }}
        >
          Create Site Map
        </Button>
      ) : (
        <Box className="flex flex-col gap-4">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Site Map Configuration
            </Typography>
            <Button
              onClick={handleClearSiteMap}
              variant="outlined"
              color="error"
              size="small"
              sx={{
                textTransform: "none",
                "&:hover": {
                  bgcolor: "error.main",
                  color: "error.contrastText",
                },
              }}
            >
              Clear Site Map
            </Button>
          </Box>
          <SiteMapInput />
          {siteMap?.actions && siteMap?.actions.length > 0 && (
            <>
              <Divider />
              <TableContainer
                sx={{
                  maxHeight: "400px",
                  overflow: "auto",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width="10%">
                        <Typography sx={{ fontWeight: 600 }}>Action</Typography>
                      </TableCell>
                      <TableCell width="30%">
                        <Typography sx={{ fontWeight: 600 }}>Type</Typography>
                      </TableCell>
                      <TableCell width="40%">
                        <Typography sx={{ fontWeight: 600 }}>XPath</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {siteMap?.actions.reverse().map((action, index) => (
                      <TableRow
                        key={action.xpath}
                        sx={{
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">{index + 1}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                action.type === "click"
                                  ? "primary.main"
                                  : "warning.main",
                              fontWeight: 500,
                            }}
                          >
                            {action.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.875rem",
                              color: "text.secondary",
                            }}
                            noWrap
                          >
                            {action.xpath}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};
