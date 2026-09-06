import { logoutAdmin } from "@/app/admin/logout/actions";
import { AdminForm } from "@/components/admin/AdminForm";

export function AdminLogoutButton() {
  return (
    <AdminForm action={logoutAdmin}>
      <button type="submit" className="admin-nav-link admin-nav-link-muted admin-logout">
        <span className="admin-nav-initial">×</span>
        <span className="admin-nav-label">Sign out</span>
      </button>
    </AdminForm>
  );
}

