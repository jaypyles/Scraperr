import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { data } = req.body;

    const headers = new Headers();
    headers.set("content-type", "application/json");
    headers.set("Authorization", `Bearer ${req.headers.authorization}`);

    try {
      const response = await fetch(
        `${global.process.env.NEXT_PUBLIC_API_URL}/api/update`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        if (response.status === 422) {
          console.error(`422 Error: ${errorDetails}`);
        }
        throw new Error(
          `Error fetching logs: ${response.statusText} - ${errorDetails}`
        );
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error submitting scrape job:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
