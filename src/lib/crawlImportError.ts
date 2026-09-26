/**
 * Shop-owner copy for a failed website import.
 * Server / network text stays out of the row label.
 */
export function crawlImportErrorMessage(serverMessage: string | null | undefined): string {
  const message = (serverMessage ?? '').trim();

  if (!message || isNetworkFailure(message)) {
    return "Couldn't reach the importer. Try again.";
  }
  if (message === 'Invalid URL format') {
    return "That doesn't look like a web address.";
  }
  if (message === 'Timed out loading the page') {
    return 'The site took too long to answer. Try again, or paste the text.';
  }
  if (/^Failed to load page \(\d+\)$/.test(message)) {
    return 'The site returned an error. Check the address, or paste the text.';
  }
  if (message === 'Failed to load page') {
    return "We couldn't open that page. Check the address, or paste the text.";
  }
  if (isMissingGeminiKey(message)) {
    return "Import isn't available right now. Paste text or upload a file.";
  }

  return 'Import failed. Try again, or paste the text.';
}

function isNetworkFailure(message: string): boolean {
  return (
    message === 'Failed to fetch' ||
    message === 'Load failed' ||
    message === 'NetworkError when attempting to fetch resource.' ||
    message === 'network error'
  );
}

function isMissingGeminiKey(message: string): boolean {
  return message === 'LLM API Key configuration missing';
}
