export function extractMentionedEmails(text: string): string[] {
  if (!text) return [];
  const emailMentionRegex =
    /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  const matches = text.match(emailMentionRegex);

  if (!matches) return [];

  // Remove the @ symbol from the beginning and return unique emails
  const emails = matches.map((match) => match.substring(1));

  // Return unique emails only
  return [...new Set(emails)];
}
