import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set("Authorization", `Bearer ${req.headers.authorization}`);

  try {
    const response = await fetch(
      `${global.process.env.NEXT_PUBLIC_API_URL}/api/job/${id}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error submitting scrape job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
