import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urls = process.env.FORWARD_URLS?.split(",") || [];

  if (!urls.length) {
    return res.status(500).json({
      error: "No URLs provided in the environment variable FORWARD_URLS",
    });
  }

  try {
    delete req.headers.host;
    delete req.headers.referer;
    console.log("body", req.body);
    const responses = await Promise.all(
      urls.map((url) =>
        fetch(url, {
          method: req.method,
          headers: req.headers as any,
          body: req.body,
        })
      )
    );

    const results = await Promise.all(
      responses.map((response) => response.text())
    );

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
