import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  INTERNAL_PROSPECTOR_PATH,
  LEGACY_ADMIN_CREATE_PATH,
  PRODUCT_BUILDER_PATH,
} from './routes';

describe('product vs internal routes', () => {
  it('keeps the official builder on home', () => {
    assert.equal(PRODUCT_BUILDER_PATH, '/');
  });

  it('keeps Prospector off the product create path', () => {
    assert.equal(INTERNAL_PROSPECTOR_PATH, '/internal/prospector');
    assert.equal(INTERNAL_PROSPECTOR_PATH.startsWith('/admin'), false);
    assert.equal(LEGACY_ADMIN_CREATE_PATH, '/admin/create');
  });
});
