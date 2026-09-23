type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function metadataString(metadata: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = metadata?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Row for public.profiles. agents.user_id references this id. */
export function profileFromAuthUser(user: AuthUser, updatedAt: string) {
  const metadata = user.user_metadata ?? undefined;
  return {
    id: user.id,
    email: user.email ?? null,
    full_name: metadataString(metadata, 'full_name') ?? metadataString(metadata, 'name'),
    avatar_url: metadataString(metadata, 'avatar_url') ?? metadataString(metadata, 'picture'),
    updated_at: updatedAt,
  };
}
