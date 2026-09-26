import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

function read(name: string) {
  return readFileSync(path.join(dir, name), 'utf8');
}

describe('labeled form controls', () => {
  it('associates Input labels with the control via htmlFor and id', () => {
    const source = read('Input.tsx');
    assert.match(source, /useId/);
    assert.match(source, /htmlFor=\{inputId\}/);
    assert.match(source, /id=\{inputId\}/);
  });

  it('associates Select labels with the control via htmlFor and id', () => {
    const source = read('Select.tsx');
    assert.match(source, /useId/);
    assert.match(source, /htmlFor=\{selectId\}/);
    assert.match(source, /id=\{selectId\}/);
  });

  it('associates TextArea labels with the control via htmlFor and id', () => {
    const source = read('TextArea.tsx');
    assert.match(source, /useId/);
    assert.match(source, /htmlFor=\{textAreaId\}/);
    assert.match(source, /id=\{textAreaId\}/);
  });
});
