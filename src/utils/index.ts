/**
 * Extract email addresses mentioned in a notification text
 * Looks for @email.com patterns and validates them as email addresses
 * @param notificationText The notification text to parse
 * @returns Array of unique email addresses found in mentions
 */
export function extractMentionedEmails(notificationText: string): string[] {
  // Regex to match @email patterns
  // This matches @ followed by valid email characters up to a space or end of string
  const emailRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  const mentions: string[] = [];
  let match;

  while ((match = emailRegex.exec(notificationText)) !== null) {
    const email = match[1]; // The captured group (email without @)
    if (!mentions.includes(email)) {
      mentions.push(email);
    }
  }

  return mentions;
}
