"use client";

import { useActionState, useId } from "react";
import { usePathname } from "next/navigation";
import { askAdminHelp, type AdminHelpState } from "../server/actions";

const initialState: AdminHelpState = {};

export function AdminHelpPanel({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const technicalId = useId();
  const [state, formAction, pending] = useActionState(askAdminHelp, initialState);

  return (
    <div className={compact ? "admin-help-panel compact" : "admin-help-panel"}>
      <div className="admin-help-intro">
        <span className="admin-pill">Verified guide + Gemini</span>
        <p>
          Ask how to use this admin area. The AI answers from the verified project guides and explains in simple language.
        </p>
      </div>

      <form action={formAction} className="admin-help-form">
        <input type="hidden" name="currentPath" value={pathname} />
        <label className="admin-field">
          Question
          <textarea
            name="question"
            rows={compact ? 3 : 5}
            required
            placeholder="Example: What should I write in the awards section?"
          />
        </label>
        <label className="admin-field admin-field-check admin-help-technical">
          <input id={technicalId} type="checkbox" name="technical" value="true" />
          Include technical notes when useful
        </label>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
          {pending ? "Checking guide..." : "Ask admin help"}
        </button>
      </form>

      {state.error && <p className="admin-form-error" aria-live="polite">{state.error}</p>}
      {state.answer && (
        <div className="admin-help-answer" aria-live="polite">
          <div className="admin-help-answer-head">
            <strong>Answer</strong>
            {state.model && <span className="mono">{state.model}</span>}
          </div>
          <p>{state.answer}</p>
        </div>
      )}

      {state.sources?.length ? (
        <details className="admin-help-sources">
          <summary>Technical source used</summary>
          {state.sources.map((source) => (
            <article key={source.id}>
              <h3>{source.title}</h3>
              <pre>{source.excerpt}</pre>
            </article>
          ))}
        </details>
      ) : null}
    </div>
  );
}
