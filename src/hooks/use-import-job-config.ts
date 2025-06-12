import { useJobSubmitterProvider } from "@/components/submit/job-submitter/provider";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export const useImportJobConfig = () => {
  const router = useRouter();
  const { setJobOptions, setSiteMap, setSubmittedURL, setRows } =
    useJobSubmitterProvider();

  const handleUploadFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onerror = () => {
        toast.error("Failed to read file");
        resolve(true);
      };

      reader.onload = (e) => {
        const result = e.target?.result as string;

        if (!result.includes("url")) {
          toast.error("Invalid job config: missing url");
          resolve(true);
          return;
        }

        if (!result.includes("job_options")) {
          toast.error("Invalid job config: missing job_options");
          resolve(true);
          return;
        }

        if (!result.includes("elements")) {
          toast.error("Invalid job config: missing elements");
          resolve(true);
          return;
        }

        if (!result.includes("site_map")) {
          toast.error("Invalid job config: missing site_map");
          resolve(true);
          return;
        }

        try {
          const jobConfig = JSON.parse(result);

          if (jobConfig.agent_mode) {
            router.push({
              pathname: "/agent",
              query: {
                url: jobConfig.url,
                prompt: jobConfig.prompt,
                job_options: JSON.stringify(jobConfig.job_options),
              },
            });
          }

          if (
            jobConfig.job_options &&
            Array.isArray(jobConfig.job_options.proxies)
          ) {
            jobConfig.job_options.proxies = "";
          }

          setJobOptions(jobConfig.job_options || {});
          setSiteMap(jobConfig.site_map);
          setSubmittedURL(jobConfig.url || "");
          setRows(jobConfig.elements || []);
          resolve(false);
        } catch (error) {
          toast.error("Failed to parse job config");
          resolve(true);
        }
      };

      reader.readAsText(file);
    });
  };

  return { handleUploadFile };
};
