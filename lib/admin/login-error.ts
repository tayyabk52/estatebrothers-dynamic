export function getAdminLoginErrorMessage(error: { status?: number }): string {
  if (error.status === 0) {
    return "Unable to reach Supabase Auth. Check this device's network connection and try again.";
  }

  return "Invalid email or password.";
}
