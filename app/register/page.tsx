import { RegisterDbBanner } from "@/components/auth/register-db-banner";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <>
      <RegisterDbBanner />
      <RegisterForm />
    </>
  );
}
