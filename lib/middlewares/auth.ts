import { lightFormat } from "date-fns";
import { decode } from "lib/jwt";
export function authMiddleware(callback) {
  return function (req, res) {
                                                                                                                                                               if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        const value = decode(token);
        callback(req, res, value);
      } catch (error) {
        res.send(error);
      }
    } else {
      return res.status(401).send({ error: "Missing token value" });
    }
  };
}
