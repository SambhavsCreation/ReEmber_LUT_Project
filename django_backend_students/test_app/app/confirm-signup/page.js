import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ConfirmSignUpForm from "../components/confirm-signup-form";

export default function ConfirmSignUpPage() {
  const cookieStore = cookies();
  const existingToken = cookieStore.get("auth_token")?.value;
  if (existingToken) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <ConfirmSignUpForm />
    </main>
  );
}
