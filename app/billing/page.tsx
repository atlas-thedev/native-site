import BillingPortalClient from "@/components/BillingPortalClient";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({ title: "Billing", description: "Receipts, payment history and your Native+ subscription.", path: "/billing", noindex: true });

export default function BillingPage() {
  return <BillingPortalClient />;
}
