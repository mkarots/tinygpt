import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'ProgressBar.tsx'),
  'utf8'
);

describe('onboarding progress rail', () => {
  it('pins the rail to the center of the h-8 step dots', () => {
    assert.match(source, /w-8 h-8 rounded-full/);
    const rails = source.match(/absolute top-4 left-0[^"]*h-1/g) ?? [];
    assert.equal(rails.length, 2, 'background and active rails both sit at top-4');
    assert.doesNotMatch(source, /absolute top-1\/2/);
    assert.doesNotMatch(source, /scale-110/);
  });
});
