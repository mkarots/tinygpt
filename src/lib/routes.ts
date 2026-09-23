/** Signed-in product builder. Create happens here; share and embed open after save. */
export const PRODUCT_BUILDER_PATH = '/admin';

/**
 * Founder-only demo factory. Not a product create surface.
 * Use this to spin a chat link for someone else to try.
 */
export const INTERNAL_PROSPECTOR_PATH = '/internal/prospector';

/** Old URL that looked like the official create path. */
export const LEGACY_ADMIN_CREATE_PATH = '/admin/create';

/** Owner view with the public chat link and embed snippet for one saved agent. */
export function adminSharePath(agentId: string): string {
  return `/admin/share/${agentId}`;
}

export function isAuthRequiredPath(pathname: string): boolean {
  return pathname.startsWith('/admin') || pathname.startsWith('/internal');
}
