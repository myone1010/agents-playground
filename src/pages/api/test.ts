import { NextApiRequest, NextApiResponse } from "next";

export default async function handleTest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({success: true, message: 'API success!'});
}