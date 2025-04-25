import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { data } = req.body;
    console.log("Data", data);

    const headers = new Headers();
    headers.set("content-type", "application/json");

    try {
      const response = await fetch(
        `${global.process.env.NEXT_PUBLIC_API_URL}/api/delete-cron-job`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        console.error(response);
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting cron job:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
