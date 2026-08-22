"use client";
import { useActionState } from "react";
import { loginAdmin, type AdminLoginState } from "./actions";
import "@/styles/admin.css";

const initialAdminLoginState: AdminLoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialAdminLoginState);
  return <div className="admin-login-wrap"><div className="admin-login-box"><div className="admin-login-brand"><span>Estate Brothers</span><span className="admin-login-tag">Admin</span></div><form action={formAction} className="admin-login-form"><label>Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" placeholder="Password" /></label>{state.error && <p className="admin-form-error" aria-live="polite">{state.error}</p>}<button type="submit" disabled={pending} className="admin-btn admin-btn-primary">{pending ? "Signing in..." : "Sign in"}</button></form></div></div>;
}
