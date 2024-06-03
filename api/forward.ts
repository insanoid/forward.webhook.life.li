import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urls = process.env.FORWARD_URLS?.split(",") || [];

  if (!urls.length) {
    return res
      .status(500)
      .json({
        error: "No URLs provided in the environment variable FORWARD_URLS",
      });
  }

  try {
    const headers = { ...req.headers };

    // Remove host header to avoid issues with cross-domain requests
    delete headers.host;

    let body;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (
        req.headers["content-type"]?.includes(
          "application/x-www-form-urlencoded"
        )
      ) {
        const formData = new URLSearchParams(req.body).toString();
        body = formData;
      } else if (req.headers["content-type"]?.includes("multipart/form-data")) {
        body = req.body;
      } else {
        body = JSON.stringify(req.body);
      }
    }

    const responses = await Promise.all(
      urls.map((url) =>
        fetch(url, {
          method: req.method,
          headers: headers as any,
          body: body,
        })
      )
    );

    const results = await Promise.all(
      responses.map(async (response) => ({
        url: response.url,
        status: response.status,
        headers: response.headers.raw(),
        body: await response.text(),
      }))
    );

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
