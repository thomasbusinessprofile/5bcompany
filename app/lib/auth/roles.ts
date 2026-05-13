export type AppRole = "buyer" | "admin" | "sales" | "sourcing" | "content_manager" | "viewer";

export const adminRoles: AppRole[] = ["admin", "sales", "sourcing", "content_manager", "viewer"];

export function getRoleHome(role?: string | null) {
  switch (role) {
    case "buyer":
      return "/buyer/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "sales":
    case "sourcing":
      return "/admin/requests";
    case "content_manager":
      return "/admin/products";
    case "viewer":
      return "/admin/dashboard";
    default:
      return "/login";
  }
}

export function canAccessBuyerArea(role?: string | null) {
  return role === "buyer";
}

export function canAccessAdminArea(role?: string | null) {
  return adminRoles.includes(role as AppRole);
}
