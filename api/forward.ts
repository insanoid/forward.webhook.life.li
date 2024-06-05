import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";
import getRawBody from "raw-body";
import { URLSearchParams } from "url";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { key } = req.query;

  if (typeof key !== "string") {
    return res
      .status(400)
      .json({ error: 'Invalid or missing query parameter "key"' });
  }

  const specificUrls = process.env[key.toUpperCase()]?.split(",") || [];
  const sharedUrls = process.env.FORWARD_URLS?.split(",") || [];

  if (!specificUrls.length && !sharedUrls.length) {
    return res
      .status(400)
      .json({ error: "No URLs provided in the environment variables" });
  }

  try {
    const headers = { ...req.headers };
    delete headers.host; // Remove host header to avoid issues with cross-domain requests

    let body;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const rawBody = await getRawBody(req);
      const contentType = req.headers["content-type"];

      if (contentType?.includes("application/x-www-form-urlencoded")) {
        body = new URLSearchParams(rawBody.toString());
      } else if (contentType?.includes("multipart/form-data")) {
        body = rawBody;
      } else {
        body = rawBody.toString();
      }
    }

    const allUrls = [...specificUrls, ...sharedUrls];

    const responses = await Promise.all(
      allUrls.map((url) =>
        fetch(url, {
          method: req.method,
          headers: headers as any,
          body: body instanceof URLSearchParams ? body.toString() : body,
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
