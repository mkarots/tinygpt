import { redirect } from 'next/navigation';
import { INTERNAL_PROSPECTOR_PATH } from '../../../lib/routes';

/** Old URL that looked like the product create path. */
export default function LegacyAdminCreatePage() {
  redirect(INTERNAL_PROSPECTOR_PATH);
}
