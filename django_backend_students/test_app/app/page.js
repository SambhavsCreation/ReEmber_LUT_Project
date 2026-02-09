import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function HomePage() {
  const cookieStore = cookies();
  const existingToken = cookieStore.get("auth_token")?.value;
  if (existingToken) {
    redirect("/dashboard");
  }
  redirect("/login");
}
