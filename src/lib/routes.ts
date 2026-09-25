/** Signed-in home. Lists that user's agents. */
export const PRODUCT_BUILDER_PATH = '/admin';

/** Onboarding wizard for a new agent. */
export const PRODUCT_CREATE_PATH = '/admin/new';

/**
 * Founder-only demo factory. Not a product create surface.
 * Use this to spin a chat link for someone else to try.
 */
export const INTERNAL_PROSPECTOR_PATH = '/internal/prospector';

/** Old URL that looked like the official create path. Redirects to PRODUCT_CREATE_PATH. */
export const LEGACY_ADMIN_CREATE_PATH = '/admin/create';

/** Owner view with the public chat link and embed snippet for one saved agent. */
export function adminSharePath(agentId: string): string {
  return `/admin/share/${agentId}`;
}

/** Open the builder with that saved agent loaded. */
export function adminEditPath(agentId: string): string {
  return `${PRODUCT_CREATE_PATH}?agent=${encodeURIComponent(agentId)}`;
}

export function isAuthRequiredPath(pathname: string): boolean {
  return pathname.startsWith('/admin') || pathname.startsWith('/internal');
}
