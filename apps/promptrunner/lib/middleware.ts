import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
type MiddlewareCallback = (result: any) => void;

export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    callback: MiddlewareCallback
  ) => void
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});
