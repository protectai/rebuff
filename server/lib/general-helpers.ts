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
    const seconds = Math.round(elapsed / 1000);
    return seconds + ` ${seconds > 1 ? "seconds" : "second"} ago`;
  } else if (elapsed < msPerHour) {
    const minutes = Math.round(elapsed / msPerMinute);
    return minutes + ` ${minutes > 1 ? "minutes" : "minute"} ago`;
  } else if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour);
    return hours + ` ${hours > 1 ? "hours" : "hour"} ago`;
  } else if (elapsed < msPerMonth) {
    const days = Math.round(elapsed / msPerDay);
    return days + ` ${days > 1 ? "days" : "day"} ago`;
  } else if (elapsed < msPerYear) {
    const months = Math.round(elapsed / msPerMonth);
    return months + ` ${months > 1 ? "months" : "month"} ago`;
  } else {
    const years = Math.round(elapsed / msPerYear);
    return years + ` ${years > 1 ? "years" : "year"} ago`;
  }
}

export function formatSQL(sql: string) {
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "LIMIT",
    "INNER JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "ORDER BY",
    "GROUP BY",
    "AND",
    "OR",
  ];

  let formattedSql = sql;

  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    formattedSql = formattedSql.replace(regex, `\n${keyword}`);
  });

  return formattedSql;
}
