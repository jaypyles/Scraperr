import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const headers = new Headers(req.headers as Record<string, string>);
    headers.set("content-type", "application/json");
    headers.set("Authorization", `Bearer ${req.headers.authorization}`);

    const response = await fetch(
      `${global.process.env.NEXT_PUBLIC_API_URL}/api/ai/check`,
      {
        method: "GET",
        headers,
      }
    );

    const checksResponse = await fetch(
      `${global.process.env.NEXT_PUBLIC_API_URL}/api/auth/check`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    const checksResult = await checksResponse.json();
    res.status(200).json({ ...result, ...checksResult });
  } catch (error) {
    console.error("Error submitting scrape job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
