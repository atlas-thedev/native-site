import AuthForm from "@/components/AuthForm";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Reset password", description: "Reset your Native account password with a code sent to your email.", path: "/forgot", noindex: true });

export default function Page() {
  return <AuthForm mode="forgot" />;
}
