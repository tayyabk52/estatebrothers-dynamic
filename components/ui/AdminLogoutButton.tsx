import { logoutAdmin } from "@/app/admin/logout/actions";

export function AdminLogoutButton() {
  return (
    <form action={logoutAdmin}>
      <button type="submit" className="admin-nav-link admin-nav-link-muted admin-logout">
        Sign out
      </button>
    </form>
  );
}

