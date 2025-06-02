export const download = async (ids: string[], jobFormat: string) => {
  const response = await fetch("/api/download", {
    method: "POST",
    body: JSON.stringify({ data: { ids, job_format: jobFormat } }),
  });

  return response;
};
