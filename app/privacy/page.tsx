import Legal, { type Section } from "@/components/Legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description: "What data Native Client and the Native online services collect, why, and the choices you have.",
  path: "/privacy",
});

const sections: Section[] = [
  {
    h: "The short version",
    body: [
      "Native only collects what it needs to run your account, locker and Relay chat. The launcher doesn’t include advertising or analytics trackers, and we don’t sell your data. Most of what the launcher stores, like instances, worlds and settings, stays on your computer.",
    ],
  },
  {
    h: "What we collect when you use a Native account",
    body: [
      [
        "Account details: your email address, username, and a salted hash of your password (we never store the password itself), plus your chosen arm model.",
        "Sessions: tokens that keep you signed in on each device you use.",
        "Verification and reset: one-time codes sent to your email to confirm sign-up and password resets.",
        "Linked Minecraft profile (optional): if you link a Microsoft/Minecraft account, we store the profile name and UUID so you can sign in with it.",
        "Locker: the skin and cape images you publish and the arm model. These are publicly retrievable by your username so other players’ launchers can show them.",
      ],
    ],
  },
  {
    h: "What we collect when you use Relay",
    body: [
      "Relay is the friends and chat layer. To make it work, the service stores your friend list and requests, blocked users, direct and group messages, images or files you send, read state, and presence (whether you’re online and, if you allow it, what instance or version you’re playing). Messages and media are visible to the people in that conversation.",
    ],
  },
  {
    h: "Technical data",
    body: [
      "Our servers see your IP address and request details when you connect. We use them to deliver the service, prevent abuse and enforce rate limits (for example, limiting repeated sign-in attempts). Our hosting and network providers may also keep standard access logs.",
    ],
  },
  {
    h: "What stays on your device",
    body: [
      "Instances, worlds, screenshots, mods, settings and playtime are stored locally. If you sign in with Microsoft, the launcher keeps your sign-in tokens on your computer in encrypted form and uses them only to talk to Microsoft and Mojang. If you turn on Discord Rich Presence, the launcher shares your status with your own Discord app on your computer.",
    ],
  },
  {
    h: "Services we connect to",
    body: [
      [
        "Microsoft and Mojang, for sign-in, ownership checks, official skins and game files.",
        "Modrinth and CurseForge, for searching and downloading mods, modpacks and other content. They receive the requests the launcher makes.",
        "mclo.gs, but only when you choose to share a log from the crash analyzer. That log is uploaded there.",
        "An email delivery provider, to send you verification and password reset emails.",
        "Tebex Limited (tebex.io), our reseller and merchant of record. When you buy a cape or Native+, Tebex collects your name, payment details, billing email and country to process the payment, calculate tax and prevent fraud. We never see or store your card details; we receive your order, its status, the email you paid with and a Tebex transaction or subscription reference so we can unlock what you bought.",
      ],
      "Each of these has its own privacy policy.",
    ],
  },
  {
    h: "This website",
    body: [
      "This site sets only the cookies it needs: when you sign in, a secure session cookie keeps you signed in (and a small cookie holds your username so the page can greet you). We store your light/dark choice and any skins you save to your library in your browser’s local storage. We don’t use advertising or third-party tracking cookies. The checkout and billing pages load Tebex’s payment form (Tebex.js), which may set the cookies it needs to take a payment securely.",
    ],
  },
  {
    h: "How we use data",
    body: [
      "To run and secure your account, sync your locker, deliver Relay messages, send the emails you request, prevent abuse, and fix problems. We don’t use your data for advertising and we don’t sell it.",
    ],
  },
  {
    h: "Sharing",
    body: [
      "We share data only with the people you choose to interact with (friends, chat participants, players who see your public skin), with providers that help us operate the service, or when the law requires it or to protect people and the service from harm.",
    ],
  },
  {
    h: "Retention and your choices",
    body: [
      "We keep account data while your account exists. You can change your skin and cape any time from the launcher or your account page, and you can leave conversations or remove friends. To have your account and its data deleted, or to ask what we hold about you, contact us through our Discord server and we’ll help.",
    ],
  },
  {
    h: "Security",
    body: ["Passwords are salted and hashed, connections use HTTPS, and sign-in attempts are rate-limited. No system is perfectly secure, so please use a strong, unique password."],
  },
  {
    h: "Children",
    body: ["Native isn’t directed at children under 13 and we don’t knowingly collect their personal information. If you believe a child has created an account, let us know and we’ll remove it."],
  },
  {
    h: "Changes",
    body: ["If we change this policy in a meaningful way we’ll update the date at the top of this page."],
  },
  {
    h: "Contact",
    body: ["Privacy questions or requests? Use the Support page or our Discord server."],
  },
];

export default function Page() {
  return <Legal title="Privacy Policy" path="/privacy" updated="October 8, 2026" intro="What Native collects, why it does, and the choices you have. Written to be read, not skimmed." sections={sections} />;
}
