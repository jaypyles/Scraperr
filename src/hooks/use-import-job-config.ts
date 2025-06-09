import { useJobSubmitterProvider } from "@/components/submit/job-submitter/provider";
import { useRouter } from "next/router";

export const useImportJobConfig = () => {
  const router = useRouter();
  const { setJobOptions, setSiteMap, setSubmittedURL, setRows } =
    useJobSubmitterProvider();

  const handleUploadFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const jobConfig = JSON.parse(e.target?.result as string);

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

      setJobOptions(jobConfig.job_options);
      setSiteMap(jobConfig.site_map);
      setSubmittedURL(jobConfig.url);
      setRows(jobConfig.elements);
    };

    reader.readAsText(file);
  };

  return { handleUploadFile };
};
