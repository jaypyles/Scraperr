import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/get-media?id=${id}`
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error streaming video:", error);
    res.status(404).json({ error: "Error streaming video" });
  }
}
