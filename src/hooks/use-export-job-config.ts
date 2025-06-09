import { Job } from "@/types";

export const useExportJobConfig = () => {
  const exportJobConfig = async (job: Job) => {
    const jobConfig = {
      url: job.url,
      prompt: job.prompt,
      job_options: job.job_options,
      elements: job.elements,
      agent_mode: job.agent_mode,
    };

    const jobConfigString = JSON.stringify(jobConfig);
    const blob = new Blob([jobConfigString], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `job_${job.id}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return { exportJobConfig };
};
