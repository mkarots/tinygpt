import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('agent preview', () => {
  it('stays on screen at a normal desktop width and stacks below that', () => {
    const app = read('App.tsx');
    const preview = read('src/components/LivePreview.tsx');
    assert.match(app, /LivePreview/);
    assert.match(app, /flex-col/);
    assert.match(app, /lg:flex-row/);
    assert.match(app, /lg:sticky/);
    assert.doesNotMatch(app, /hidden xl:flex/);
    assert.doesNotMatch(preview, /hidden xl:flex/);
    assert.doesNotMatch(preview, /(^|\s)hidden(\s|$)/);
    assert.match(preview, /Website Preview/);
    assert.match(preview, /WidgetChat config=\{config\}/);
  });
});
