import { Suspense } from "react";

import { AuthPanelLoader } from "@/components/auth-panel-loader";
import { AuthPanelShell } from "@/components/auth-panel-shell";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthPanelShell />}>
      <AuthPanelLoader variant="reset-password" />
    </Suspense>
  );
}
