import { redirect } from "next/navigation";

import { AuthPanelLoader } from "@/components/auth-panel-loader";
import { getCurrentUser } from "@/lib/auth";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return <AuthPanelLoader variant="forgot-password" />;
}
