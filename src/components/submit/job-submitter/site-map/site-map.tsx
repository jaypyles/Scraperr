import { useEffect, useState } from "react";
import { useJobSubmitterProvider } from "../provider";
import { Button, Divider, Typography, useTheme } from "@mui/material";
import { SiteMapInput } from "./site-map-input";

export const SiteMap = () => {
  const { siteMap, setSiteMap } = useJobSubmitterProvider();
  const [showSiteMap, setShowSiteMap] = useState<boolean>(false);
  const theme = useTheme();

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
    <div className="flex flex-col gap-4">
      {siteMap ? (
        <Button onClick={handleClearSiteMap}>Clear Site Map</Button>
      ) : (
        <Button onClick={handleCreateSiteMap}>Create Site Map</Button>
      )}
      {showSiteMap && (
        <div className="flex flex-col gap-4">
          <SiteMapInput />
          {siteMap?.actions && siteMap?.actions.length > 0 && (
            <>
              <Divider
                sx={{
                  borderColor:
                    theme.palette.mode === "dark" ? "#ffffff" : "0000000",
                }}
              />
              <Typography className="w-full text-center" variant="h5">
                Site Map Actions
              </Typography>
            </>
          )}
          <ul className="flex flex-col gap-4">
            {siteMap?.actions.reverse().map((action, index) => (
              <li key={action.xpath} className="flex w-full items-center">
                <Typography variant="h6" className="w-[10%] mr-2">
                  Action {index + 1}:
                </Typography>
                <SiteMapInput
                  disabled={Boolean(siteMap)}
                  xpath={action.xpath}
                  option={action.type}
                  clickOnce={action.do_once}
                  input={action.input}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
