import AuthForm from "@/components/AuthForm";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Sign in", description: "Sign in to your Native account.", path: "/login", noindex: true });

export default function Page() {
  return <AuthForm mode="login" />;
}
