import { stripHtml } from 'string-strip-html'; /* eslint-disable-line */

function sanitizeStrings(strings) {
  return strings.map((string) => stripHtml(string).result.trim());
}

export default sanitizeStrings;
