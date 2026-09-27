/**
 * Iframe host for the embed script. `public/tinygpt.js` uses the same
 * expression inline so the file can stay a classic script (`document.currentScript`).
 * A query string on the script URL is not part of the origin.
 */
export function widgetBaseUrl(scriptSrc: string): string {
  return new URL(scriptSrc).origin;
}
