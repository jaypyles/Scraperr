import { ApiService } from "@/services";
import { useState } from "react";

export const useDownloadJob = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadJob = async (ids: string[], jobFormat: string) => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await ApiService.download(ids, jobFormat);
      if (!response.ok) {
        throw new Error("Failed to download job");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `job_${ids[0]}.${jobFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error as string);
    } finally {
      setIsDownloading(false);
    }
  };

  return { isDownloading, error, downloadJob };
};
