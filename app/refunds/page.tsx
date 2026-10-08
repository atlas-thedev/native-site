import Legal, { type Section } from "@/components/Legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Refund Policy",
  description: "How refunds work for Native capes and Native+ memberships.",
  path: "/refunds",
});

const sections: Section[] = [
  {
    h: "Who sells to you",
    body: [
      "Our order process is conducted by our online reseller Tebex Limited (tebex.io). Tebex is the merchant of record for all our orders, handles payment, tax and receipts, and processes refunds.",
    ],
  },
  {
    h: "14-day refunds",
    body: [
      "If you’re not happy with a purchase you can ask for a full refund within 14 days of paying, whether it was a cape or a Native+ payment. You don’t need to give a reason.",
      "After 14 days we review requests case by case, for example if something didn’t work as described or you were charged by mistake.",
    ],
  },
  {
    h: "How to ask for a refund",
    body: [
      [
        "contact us through the Support page or our Discord server with the email you paid with and your transaction ID (it’s on your Tebex receipt), and we’ll issue the refund;",
        "or contact Tebex’s payment support using the details in your receipt email.",
      ],
      "Refunds go back to the original payment method. Your bank may take 5–10 business days to show it.",
    ],
  },
  {
    h: "What happens after a refund",
    body: [
      "A refunded cape leaves your Native locker. If you were wearing it, it’s taken off.",
      "A refunded Native+ payment ends the membership: capes and cosmetics you got through Native+ leave your locker and the Native+ badge is removed.",
    ],
  },
  {
    h: "Cancelling Native+",
    body: [
      "You can cancel Native+ at any time from your account page (Manage billing), which opens the Tebex payment portal. Cancelling stops future renewals; you keep Native+ until the end of the period you already paid for.",
    ],
  },
  {
    h: "Chargebacks",
    body: ["Please contact us before opening a chargeback. We’ll sort it out faster that way. Accounts with fraudulent chargebacks may lose the related purchases."],
  },
  {
    h: "Your rights",
    body: ["This policy doesn’t limit any rights you have under the consumer laws of the country you live in."],
  },
];

export default function Page() {
  return <Legal title="Refund Policy" path="/refunds" updated="October 8, 2026" intro="Short and simple: changed your mind? Ask within 14 days and you’ll get your money back." sections={sections} />;
}
