import RebuffApi from "@rebuff/sdk/src/api";
import { getEnvironmentVariable } from "./general-helpers";

export const rebuff = new RebuffApi({
  apiKey: getEnvironmentVariable("REBUFF_API_KEY"),
  apiUrl: getEnvironmentVariable("REBUFF_API") ?? "https://api.rebuff.dev",
});
