export function getEnvironmentVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// Normalize a string by converting to lowercase and removing extra spaces and punctuation
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function tryUntilDeadline(
  deadline: number,
  funcPromise: Promise<any>,
  funcSuccess: (response: any) => boolean
) {
  const startTime = Date.now();

  while (Date.now() < startTime + deadline) {
    try {
      const response = await funcPromise;

      if (funcSuccess(response)) {
        return response;
      }

      // Wait for a short time before trying again.
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Error calling function", error);

      // Wait for a short time before trying again.
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw new Error("Deadline elapsed without a satisfactory response.");
}

export function timeDifference(previous: Date) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = Date.now() - previous.getTime();

  if (elapsed === 0) {
    return "Just now";
  } else if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}
