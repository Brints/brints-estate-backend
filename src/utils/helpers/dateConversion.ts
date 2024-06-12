export function dateConversion(date: Date, format: string): string {
  const now = new Date();
  const expiration = new Date(date);
  let output = "";

  const diff = expiration.getTime() - now.getTime();

  if (format === "minutes") {
    output = diff < 2 ? "1 minute" : Math.ceil(diff / 60000) + " minutes";
  } else if (format === "hours") {
    output = diff < 2 ? "1 hour" : Math.ceil(diff / 3600000) + " hours";
  } else if (format === "days") {
    output = diff < 2 ? "1 day" : Math.ceil(diff / 86400000) + " days";
  } else if (format === "months") {
    output = diff < 2 ? "1 month" : Math.ceil(diff / 2628000000) + " months";
  } else if (format === "years") {
    output = diff < 2 ? "1 year" : Math.ceil(diff / 31540000000) + " years";
  } else {
    output = "Invalid format";
  }

  return output;
}
