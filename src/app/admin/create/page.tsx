import { redirect } from 'next/navigation';
import { PRODUCT_CREATE_PATH } from '../../../lib/routes';

/** Old URL that looked like the product create path. */
export default function LegacyAdminCreatePage() {
  redirect(PRODUCT_CREATE_PATH);
}
