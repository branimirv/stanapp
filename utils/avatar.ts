const AVATAR_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'] as const;

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  if (first && last) return `${first}${last}`.toUpperCase();
  return (first || last || '?').toUpperCase();
}

/** Initials from a single display name ("Branimir Valentin" → "BV"). */
export function getInitialsFromFullName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return getInitials(parts[0], parts[parts.length - 1]);
  }
  return getInitials(parts[0] ?? '', '');
}

/** Split a display name for stacked hero typography ("Ana Anić" → first / rest). */
export function splitDisplayName(fullName: string): { first: string; rest: string | null } {
  const trimmed = fullName.trim();
  const space = trimmed.indexOf(' ');
  if (space <= 0) return { first: trimmed, rest: null };
  return {
    first: trimmed.slice(0, space),
    rest: trimmed.slice(space + 1).trim() || null,
  };
}

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
