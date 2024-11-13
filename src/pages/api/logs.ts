import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/logs`,
      {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
        },
      }
    );

    if (!response.ok || !response.body) {
      throw new Error(`Error fetching logs: ${response.statusText}`);
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    });

    let responseStream = response.body;
    const reader = responseStream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      res.write(`data: ${chunk}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error("Error streaming logs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
