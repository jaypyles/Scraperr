import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data } = req.body;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      if (response.status === 422) {
        console.error(`422 Error: ${errorDetails}`);
      }
      throw new Error(
        `Error fetching logs: ${response.statusText} - ${errorDetails}`
      );
    }

    if (!response.body) {
      throw new Error(`No response body from API`);
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
      res.write(`${chunk}`);
    }

    res.end();
  } catch (error) {
    console.error("Error streaming logs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
