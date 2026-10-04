import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <h1 className="text-[2.25rem]">Wedding admin</h1>
      <p className="mt-1 text-moss-soft">Guest list, RSVPs and site content.</p>
      <LoginForm />
    </main>
  );
}
