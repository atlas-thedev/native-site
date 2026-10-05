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
      "Our order process is conducted by our online reseller Paddle.com. Paddle.com is the merchant of record for all our orders. Paddle provides all customer service inquiries about payments and handles returns and refunds.",
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
        "use the link in the receipt email from Paddle, or visit paddle.net and look up your order;",
        "or contact us through the Support page or our Discord server with the email you paid with and your order number.",
      ],
      "Refunds go back to the original payment method. Your bank may take 5–10 business days to show it.",
    ],
  },
  {
    h: "What happens after a refund",
    body: [
      "A refunded cape leaves your Native locker. If you were wearing it, it’s taken off.",
      "A refunded Native+ payment ends the membership: capes you got through Native+ leave your locker and the Native+ badge is removed.",
    ],
  },
  {
    h: "Cancelling Native+",
    body: [
      "You can cancel Native+ at any time from your account page (Manage billing) or from the link in your Paddle receipt. Cancelling stops future renewals; you keep Native+ until the end of the period you already paid for.",
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
  return <Legal title="Refund Policy" path="/refunds" updated="October 3, 2026" intro="Short and simple: changed your mind? Ask within 14 days and you’ll get your money back." sections={sections} />;
}
