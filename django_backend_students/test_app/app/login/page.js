import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "../components/login-form";

export default function LoginPage() {
  const cookieStore = cookies();
  const existingToken = cookieStore.get("auth_token")?.value;
  if (existingToken) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <LoginForm />
    </main>
  );
}
