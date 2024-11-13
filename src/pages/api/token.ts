import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const body = new URLSearchParams(req.body as string);
    const username = body.get("username") || "";
    const password = body.get("password") || "";

    const headers = new Headers();
    headers.set("content-type", "application/x-www-form-urlencoded");

    try {
      const response = await fetch(
        `${global.process.env.NEXT_PUBLIC_API_URL}/api/auth/token`,
        {
          method: "POST",
          headers,
          body: new URLSearchParams({ username, password }).toString(),
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
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
