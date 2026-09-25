import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  PRODUCT_INK,
  PRODUCT_PAPER,
  PRODUCT_TERRACOTTA,
} from './productTheme';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

const PRODUCT_SURFACES = [
  'components/views/admin/AgentDashboard.tsx',
  'components/views/admin/ShareAgentPage.tsx',
  'components/Onboarding.tsx',
  'components/onboarding/HeaderTitle.tsx',
  'components/onboarding/ProgressBar.tsx',
  'components/onboarding/OnboardingHeader.tsx',
  'components/views/chat/ChatPage.tsx',
  'app/embed/[id]/page.tsx',
  'components/WidgetChat.tsx',
  'components/SignedInShell.tsx',
  'components/core/button/Button.tsx',
];

describe('product theme', () => {
  it('matches the landing paper, ink, and terracotta', () => {
    const landing = read('components/landing/LandingPage.tsx');
    assert.equal(PRODUCT_PAPER, '#F6F1E8');
    assert.equal(PRODUCT_INK, '#1F1B16');
    assert.equal(PRODUCT_TERRACOTTA, '#B4532A');
    assert.match(landing, new RegExp(PRODUCT_PAPER));
    assert.match(landing, new RegExp(PRODUCT_TERRACOTTA));
    assert.match(landing, new RegExp(PRODUCT_INK));
  });

  it('loads landing fonts for the whole app', () => {
    const layout = read('app/layout.tsx');
    assert.match(layout, /Figtree/);
    assert.match(layout, /Fraunces/);
    assert.match(layout, /--font-landing-sans/);
    assert.match(layout, /--font-landing-serif/);
  });

  it('uses terracotta primary actions instead of purple fills', () => {
    const button = read('components/core/button/Button.tsx');
    assert.match(button, /bg-terracotta/);
    assert.doesNotMatch(button, /bg-blue-600|bg-brand-600|#7c3aed/);

    for (const file of PRODUCT_SURFACES) {
      const source = read(file);
      assert.doesNotMatch(
        source,
        /bg-brand-600/,
        `${file} still has a purple filled control`
      );
    }
  });

  it('gives each product page a serif title', () => {
    assert.match(read('components/core/typography/Heading.tsx'), /font-serif/);
    assert.match(read('components/onboarding/HeaderTitle.tsx'), /font-serif/);
    assert.match(read('components/views/chat/ChatPage.tsx'), /font-serif/);
    assert.match(read('components/WidgetChat.tsx'), /font-serif/);
  });
});
