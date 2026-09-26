import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { crawlImportErrorMessage } from './crawlImportError';

describe('crawlImportErrorMessage', () => {
  it('maps invalid URL', () => {
    assert.equal(
      crawlImportErrorMessage('Invalid URL format'),
      "That doesn't look like a web address."
    );
  });

  it('maps timeout', () => {
    assert.equal(
      crawlImportErrorMessage('Timed out loading the page'),
      'The site took too long to answer. Try again, or paste the text.'
    );
  });

  it('maps HTTP status failures', () => {
    assert.equal(
      crawlImportErrorMessage('Failed to load page (404)'),
      'The site returned an error. Check the address, or paste the text.'
    );
    assert.equal(
      crawlImportErrorMessage('Failed to load page (503)'),
      'The site returned an error. Check the address, or paste the text.'
    );
  });

  it('maps bare load failure', () => {
    assert.equal(
      crawlImportErrorMessage('Failed to load page'),
      "We couldn't open that page. Check the address, or paste the text."
    );
  });

  it('maps missing Gemini key', () => {
    assert.equal(
      crawlImportErrorMessage('LLM API Key configuration missing'),
      "Import isn't available right now. Paste text or upload a file."
    );
  });

  it('maps network failure and empty input', () => {
    assert.equal(
      crawlImportErrorMessage('Failed to fetch'),
      "Couldn't reach the importer. Try again."
    );
    assert.equal(
      crawlImportErrorMessage(null),
      "Couldn't reach the importer. Try again."
    );
    assert.equal(
      crawlImportErrorMessage(''),
      "Couldn't reach the importer. Try again."
    );
  });

  it('uses a short fallback for unknown server text', () => {
    assert.equal(
      crawlImportErrorMessage('Sign in required to import a website'),
      'Import failed. Try again, or paste the text.'
    );
  });
});
