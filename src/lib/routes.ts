/** Signed-in product builder: onboarding, knowledge, appearance, deploy. */
export const PRODUCT_BUILDER_PATH = '/admin';

/**
 * Founder-only demo factory. Not a product create surface.
 * Use this to spin a chat link for someone else to try.
 */
export const INTERNAL_PROSPECTOR_PATH = '/internal/prospector';

/** Old URL that looked like the official create path. */
export const LEGACY_ADMIN_CREATE_PATH = '/admin/create';

export function isAuthRequiredPath(pathname: string): boolean {
  return pathname.startsWith('/admin') || pathname.startsWith('/internal');
}
