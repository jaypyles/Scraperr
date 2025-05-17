import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, type, file } = req.query;

  if (!id || !type || !file) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/media?id=${id}&type=${type}&file=${file}`
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    res.setHeader("Content-Type", contentType);

    const arrayBuffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Error streaming media:", error);
    res.status(404).json({ error: "Error retrieving media file" });
  }
}
