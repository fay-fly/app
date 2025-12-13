export type UserRole = "user" | "creator" | "admin" | "lead";

export function canCreatePosts(role?: string | null): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "creator" || normalizedRole === "admin";
}

export function canDeletePost(role: string | null | undefined, isOwnPost: boolean): boolean {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "admin") return true;
  if (normalizedRole === "creator" && isOwnPost) return true;
  return false;
}

export function hasVerifiedBadge(role?: string | null): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "creator" || normalizedRole === "admin";
}

export function canPinPosts(role?: string | null): boolean {
  return true;
}

export function isCreatorOrAdmin(role?: string | null): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "creator" || normalizedRole === "admin";
}

export function normalizeRole(role?: string | null): UserRole {
  if (!role) return "user";
  const normalized = role.toLowerCase();
  if (normalized === "creator" || normalized === "admin" || normalized === "lead") {
    return normalized as UserRole;
  }
  return "user";
}
