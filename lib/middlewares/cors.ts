import NextCors from "nextjs-cors";

export function corsMiddleware(callback) {
  return async function (req, res) {
    try {
      await NextCors(req, res, {
        // Options
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        origin: "*",
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      });
      callback(req, res);
    } catch (error) {
      console.error(error);
      return error;
    }
  };
}
