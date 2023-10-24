import { RebuffApi } from "rebuff";
import { getEnvironmentVariable } from "./general-helpers";

export const rebuff = new RebuffApi({
  apiKey: getEnvironmentVariable("REBUFF_API_KEY"),
  apiUrl: getEnvironmentVariable("REBUFF_API") ?? "https://api.rebuff.dev",
});
