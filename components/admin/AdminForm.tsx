"use client";

import { useActionState, type ComponentProps } from "react";
import { unstable_rethrow } from "next/navigation";

type State = { status: "idle" | "success" | "error"; message: string };
const initialState: State = { status: "idle", message: "" };

export function AdminForm({ action, children, onSubmit, ...props }: Omit<ComponentProps<"form">, "action"> & {
  action: (data: FormData) => void | Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(async (_previous: State, data: FormData): Promise<State> => {
    try {
      await action(data);
      window.dispatchEvent(new Event("admin-action-complete"));
      return { status: "success", message: "Action completed successfully." };
    } catch (error) {
      unstable_rethrow(error);
      return { status: "error", message: "This action could not be completed. Your inputs are still here. Check the fields and your connection before trying again." };
    }
  }, initialState);

  return (
    <form {...props} action={formAction} aria-busy={pending} onReset={(event) => event.preventDefault()} onSubmit={(event) => { if (pending) event.preventDefault(); else onSubmit?.(event); }}>
      <fieldset className="admin-action-fields" disabled={pending}>{children}</fieldset>
      <div className={`admin-action-feedback ${state.status}`} role={state.status === "error" && !pending ? "alert" : "status"} aria-live="polite">
        {pending ? <><span className="admin-action-spinner" aria-hidden="true" /> Working… Please wait.</> : state.message}
      </div>
    </form>
  );
}
