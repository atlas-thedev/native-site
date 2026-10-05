import { Suspense } from "react";
import CheckoutClient from "@/components/CheckoutClient";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({ title: "Checkout", description: "Pay securely for Native capes and Native+.", path: "/checkout", noindex: true });

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutClient />
    </Suspense>
  );
}
