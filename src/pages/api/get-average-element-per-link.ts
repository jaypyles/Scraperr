import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set("Authorization", `Bearer ${req.headers.authorization}`);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/statistics/get-average-element-per-link`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const csvText = await response.text();
    res.status(200).send(csvText);
  } catch (error) {
    console.error("Error submitting scrape job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
