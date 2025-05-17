import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/recordings/${id}`
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");

    const reader = response.body?.getReader();

    if (!reader) {
      res.status(404).json({ error: "Recording not found" });
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }

    res.end();
  } catch (error) {
    console.error("Error streaming video:", error);
    res.status(404).json({ error: "Error streaming video" });
  }
}
