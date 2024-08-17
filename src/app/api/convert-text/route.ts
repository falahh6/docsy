// app/api/convert-pdf-url/route.js
import pdf from "pdf-parse";
import fetch from "node-fetch";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
      });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch PDF" }), {
        status: 500,
      });
    }

    const buffer = await response.buffer();
    const data = await pdf(buffer);

    return new Response(JSON.stringify({ text: data.text }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error processing PDF" }), {
      status: 500,
    });
  }
}
