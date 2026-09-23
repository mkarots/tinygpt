function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function absoluteUrl(origin: string, path: string): string {
  const base = origin.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function embedSnippet(origin: string, agentId: string): string {
  const src = escapeHtmlAttr(absoluteUrl(origin, '/tinygpt.js'));
  const id = escapeHtmlAttr(agentId);
  return `<script src="${src}" data-id="${id}" async></script>`;
}

export function agentShareLinks(origin: string, agentId: string) {
  return {
    shareUrl: absoluteUrl(origin, `/chat/${agentId}`),
    embedUrl: absoluteUrl(origin, `/embed/${agentId}`),
    snippet: embedSnippet(origin, agentId),
  };
}
