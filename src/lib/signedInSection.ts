export type SignedInSection = {
  label: string;
  title: string;
  showBackToAgents: boolean;
};

/** Labels and titles for the signed-in chrome. */
export function signedInSection(pathname: string, search = ''): SignedInSection {
  const path = pathname.replace(/\/$/, '') || '/';
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  if (path === '/admin') {
    return { label: 'Your agents', title: 'Your agents · TinyGPT', showBackToAgents: false };
  }
  if (path.startsWith('/admin/new') && params.get('agent')) {
    return { label: 'Edit agent', title: 'Edit agent · TinyGPT', showBackToAgents: true };
  }
  if (path.startsWith('/admin/new')) {
    return { label: 'New agent', title: 'New agent · TinyGPT', showBackToAgents: true };
  }
  if (path.startsWith('/admin/share/')) {
    return { label: 'Share', title: 'Share · TinyGPT', showBackToAgents: true };
  }
  if (path.startsWith('/internal/prospector')) {
    return { label: 'Prospector', title: 'Prospector · TinyGPT', showBackToAgents: true };
  }
  if (path.startsWith('/admin')) {
    return { label: 'Account', title: 'TinyGPT', showBackToAgents: true };
  }
  if (path.startsWith('/internal')) {
    return { label: 'Internal', title: 'Internal · TinyGPT', showBackToAgents: true };
  }

  return { label: 'Account', title: 'TinyGPT', showBackToAgents: false };
}
