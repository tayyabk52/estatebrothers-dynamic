"use client";
import { AdminForm } from "@/components/admin/AdminForm";

interface Props {
  action: (formData: FormData) => Promise<void>;
  label?: string;
}

export function DeleteButton({ action, label = "Delete" }: Props) {
  return (
    <AdminForm
      action={action}
      onSubmit={(event) => {
        if (!confirm(`${label} — are you sure? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="admin-btn admin-btn-danger">{label}</button>
    </AdminForm>
  );
}
