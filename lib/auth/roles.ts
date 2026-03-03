export function parseRoles(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
}

export function hasRole(value: string | null | undefined, role: string) {
  return parseRoles(value).includes(role.trim().toLowerCase());
}

export function isAdminRole(value: string | null | undefined) {
  return hasRole(value, "admin");
}
