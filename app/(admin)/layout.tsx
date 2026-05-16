export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <span>Estate Brothers Admin</span>
      </nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}
