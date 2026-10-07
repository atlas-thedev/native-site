import AuthForm from "@/components/AuthForm";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Create account", description: "Create a free Native account for friends, chat, cloaks and settings across devices.", path: "/register", noindex: true });

export default function Page() {
  return <AuthForm mode="register" />;
}
