import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { data } = req.body;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${req.headers.authorization}`);
    headers.set("content-type", "application/json");

    try {
      const response = await fetch(
        `${global.process.env.NEXT_PUBLIC_API_URL}/api/submit-scrape-job`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.status === 500) {
        res.status(500).json({ error: result.error });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error submitting scrape job:", error);
      res.status(500).json({ error: error });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
