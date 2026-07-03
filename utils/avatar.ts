const AVATAR_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'] as const;

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  if (first && last) return `${first}${last}`.toUpperCase();
  return (first || last || '?').toUpperCase();
}

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
