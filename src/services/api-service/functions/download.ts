export const download = async (ids: string[], jobFormat: string) => {
  const response = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { ids, job_format: jobFormat } }),
  });

  return response;
};
