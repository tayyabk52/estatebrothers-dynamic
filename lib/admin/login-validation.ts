export type AdminLoginCredentials = {
  email: string;
  password: string;
};

export type AdminLoginValidationResult =
  | { credentials: AdminLoginCredentials }
  | { error: string };

export function validateAdminLoginCredentials(
  formData: FormData
): AdminLoginValidationResult {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Enter both your email address and password." };
  }

  const normalizedEmail = email.trim();
  if (!normalizedEmail || !password) {
    return { error: "Enter both your email address and password." };
  }

  return { credentials: { email: normalizedEmail, password } };
}
