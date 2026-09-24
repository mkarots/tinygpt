import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const dropZonePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'DropZone.tsx');

describe('DropZone upload copy', () => {
  it('advertises only text types that are parsed and matches the file input', () => {
    const source = readFileSync(dropZonePath, 'utf8');
    assert.match(source, /accept="\.txt,\.md,\.html"/);
    assert.match(source, /\.txt, \.md, HTML \(Max 5MB\)/);
    assert.doesNotMatch(source, /PDF/);
    assert.doesNotMatch(source, /accept="[^"]*\.pdf/);
  });
});
