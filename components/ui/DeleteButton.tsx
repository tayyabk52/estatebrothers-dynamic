"use client";

interface Props {
  action: (formData: FormData) => Promise<void>;
  label?: string;
}

export function DeleteButton({ action, label = "Delete" }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`${label} — are you sure? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="admin-btn admin-btn-danger">{label}</button>
    </form>
  );
}
