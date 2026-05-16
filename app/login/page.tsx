import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center px-4 text-base text-muted-foreground">
          読み込み中…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
