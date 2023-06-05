import { randomBytes } from "crypto";

export default function generateApiKey(length: number = 64): string {
  // Generate half the number of bytes, since each byte is represented by two hexadecimal characters
  const numBytes = Math.ceil(length / 2);
  const apiKey = randomBytes(numBytes).toString("hex");
  // Truncate the result to the desired length in case of odd length values
  return apiKey.substring(0, length);
}
