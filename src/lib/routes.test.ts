import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  INTERNAL_PROSPECTOR_PATH,
  LEGACY_ADMIN_CREATE_PATH,
  PRODUCT_BUILDER_PATH,
  PRODUCT_CREATE_PATH,
  adminSharePath,
  isAuthRequiredPath,
} from './routes';

describe('product vs internal routes', () => {
  it('keeps the signed-in agent list on /admin and create on /admin/new', () => {
    assert.equal(PRODUCT_BUILDER_PATH, '/admin');
    assert.equal(PRODUCT_CREATE_PATH, '/admin/new');
    assert.equal(isAuthRequiredPath(PRODUCT_CREATE_PATH), true);
  });

  it('keeps Prospector off the product create path', () => {
    assert.equal(INTERNAL_PROSPECTOR_PATH, '/internal/prospector');
    assert.equal(INTERNAL_PROSPECTOR_PATH.startsWith('/admin'), false);
    assert.equal(LEGACY_ADMIN_CREATE_PATH, '/admin/create');
  });

  it('requires auth for the builder and internal tools', () => {
    assert.equal(isAuthRequiredPath('/admin'), true);
    assert.equal(isAuthRequiredPath('/admin/anything'), true);
    assert.equal(isAuthRequiredPath('/internal/prospector'), true);
    assert.equal(isAuthRequiredPath('/chat/abc'), false);
    assert.equal(isAuthRequiredPath('/login'), false);
  });

  it('puts the post-save share view on the authenticated builder', () => {
    const path = adminSharePath('agent-1');
    assert.equal(path, '/admin/share/agent-1');
    assert.equal(isAuthRequiredPath(path), true);
    assert.equal(path.startsWith('/chat/'), false);
  });
});
