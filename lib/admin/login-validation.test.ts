import { describe, expect, it } from "vitest";
import { validateAdminLoginCredentials } from "./login-validation";

describe("validateAdminLoginCredentials", () => {
  it("returns trimmed credentials when email and password are provided", () => {
    const formData = new FormData();
    formData.set("email", "  admin@example.com  ");
    formData.set("password", "password");

    expect(validateAdminLoginCredentials(formData)).toEqual({
      credentials: { email: "admin@example.com", password: "password" },
    });
  });

  it("rejects missing credentials before contacting Supabase", () => {
    const formData = new FormData();
    formData.set("email", "admin@example.com");

    expect(validateAdminLoginCredentials(formData)).toEqual({
      error: "Enter both your email address and password.",
    });
  });
});
