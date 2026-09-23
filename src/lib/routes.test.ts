import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  INTERNAL_PROSPECTOR_PATH,
  LEGACY_ADMIN_CREATE_PATH,
  PRODUCT_BUILDER_PATH,
  isAuthRequiredPath,
} from './routes';

describe('product vs internal routes', () => {
  it('keeps the official builder on /admin', () => {
    assert.equal(PRODUCT_BUILDER_PATH, '/admin');
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
});
