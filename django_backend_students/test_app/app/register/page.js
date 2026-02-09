import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RegisterForm from "../components/register-form";

export default function RegisterPage() {
  const cookieStore = cookies();
  const existingToken = cookieStore.get("auth_token")?.value;
  if (existingToken) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <RegisterForm />
    </main>
  );
}
