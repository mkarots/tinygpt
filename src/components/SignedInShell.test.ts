import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('signed-in shell', () => {
  it('shows the wordmark, current section, and Sign out', () => {
    const shell = read('components/SignedInShell.tsx');
    assert.match(shell, /TinyGPT/);
    assert.match(shell, /section\.label/);
    assert.match(shell, /Sign out/);
    assert.match(shell, /signOutToLanding/);
    assert.match(shell, /router\.replace\('\/'\)/);
    assert.match(shell, /router\.refresh\(\)/);
  });

  it('links back to Your agents from the builder and share pages', () => {
    const shell = read('components/SignedInShell.tsx');
    assert.match(shell, /showBackToAgents/);
    assert.match(shell, /PRODUCT_BUILDER_PATH/);
    assert.match(shell, /Your agents/);
  });

  it('wraps every signed-in admin and internal page', () => {
    const admin = read('app/admin/layout.tsx');
    const internal = read('app/internal/layout.tsx');
    assert.match(admin, /SignedInShell/);
    assert.match(internal, /SignedInShell/);
    assert.match(admin, /Your agents/);
  });
});
