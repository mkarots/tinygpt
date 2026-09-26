import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('QuickQuestionsEditor accessible names', () => {
  it('names each remove control Remove question N', () => {
    const source = read('components/QuickQuestionsEditor.tsx');
    assert.match(source, /aria-label=\{`Remove question \$\{idx \+ 1\}`\}/);
  });

  it('names each question text field so the placeholder is only a hint', () => {
    const source = read('components/QuickQuestionsEditor.tsx');
    assert.match(source, /aria-label=\{`Question \$\{idx \+ 1\} text`\}/);
    assert.match(source, /placeholder="Question text\.\.\."/);
  });
});
