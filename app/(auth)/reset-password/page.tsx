import { Suspense } from "react";

import { AuthPanel } from "@/components/auth-panel";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <AuthPanel variant="reset-password" />
    </Suspense>
  );
}
