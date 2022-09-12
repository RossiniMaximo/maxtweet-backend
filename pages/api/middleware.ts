import type { NextRequest } from "next/server";
console.log("ghola");

export function middleware(req: NextRequest) {
  if (req.method == "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers": req.headers.get(
          "Access-Control-Request-Headers"
        ),
        Vary: "Access-Control-Request-Headers",
        "Content-Length": "0",
      },
    });
  }
}
