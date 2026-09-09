import { Suspense } from "react";
import LoginForm from "./login-form";
export const metadata = { robots: { index: false, follow: true } };

export default function LoginPage() {
  return <Suspense fallback={<main className="login-shell" />}><LoginForm /></Suspense>;
}
