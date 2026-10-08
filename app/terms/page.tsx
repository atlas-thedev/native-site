import Legal, { type Section } from "@/components/Legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms of Service",
  description: "The rules for using Native Client, Native accounts, the skin locker, cape purchases, Native+ and Relay chat.",
  path: "/terms",
});

const sections: Section[] = [
  {
    h: "Agreement",
    body: [
      "These terms govern your use of the Native Client launcher, this website, and the Native online services (accounts, skin locker and Relay). By installing the launcher, creating an account or using the services you agree to these terms. If you don’t agree, please don’t use them.",
    ],
  },
  {
    h: "What Native is and isn’t",
    body: [
      "Native Client is a free launcher that helps you install, organise and start Minecraft: Java Edition. It is not an official Minecraft product and is not approved by or associated with Mojang Studios or Microsoft. “Minecraft” is a trademark of Mojang Studios.",
      "Native doesn’t sell or distribute Minecraft. To play online you need your own Minecraft licence and a Microsoft account. Offline mode and Native accounts don’t include a Minecraft licence.",
    ],
  },
  {
    h: "Your account",
    body: [
      "You can create a Native account with an email address, a username and a password. You are responsible for keeping your password secret and for activity on your account. Give us accurate information and tell us if you think your account has been accessed without permission.",
      "You must be old enough to form a binding agreement where you live, or have a parent or guardian’s permission. Native is not directed at children under 13.",
    ],
  },
  {
    h: "Acceptable use",
    body: [
      "Keep Native friendly and safe. When using the services you agree not to:",
      [
        "harass, threaten, impersonate or spam other people, including in Relay chats and group chats;",
        "upload or share content that is illegal, hateful, sexually explicit, or that you don’t have the right to share;",
        "attack, overload, scrape or probe the services, bypass rate limits, or try to access other people’s accounts or data;",
        "use the services to distribute malware, cheats that harm other players, or to break the rules of Minecraft, Mojang, Microsoft or any server you join;",
        "resell or commercially exploit the services without our permission.",
      ],
    ],
  },
  {
    h: "Your content",
    body: [
      "You keep ownership of the content you create or upload, such as skins, capes, messages and images. You give Native a limited, worldwide, non-exclusive licence to store, process and display that content only as needed to run the services, for example showing your skin to other players or delivering your messages to the people you send them to.",
      "Skins and capes you publish to your locker are publicly retrievable by your username so that other players’ launchers can display them. Don’t publish anything you wouldn’t want others to see.",
      "We may remove content that breaks these terms.",
    ],
  },
  {
    h: "Third-party services and mods",
    body: [
      "Native connects to services we don’t control, including Microsoft and Mojang (sign-in and game files), Modrinth and CurseForge (mods, modpacks and other content), and, only when you choose to share a log, mclo.gs. Their terms and privacy policies apply to your use of them.",
      "Mods, modpacks, shaders and other content you install are made by third parties. We don’t review or guarantee them. Install content at your own risk and respect its licence.",
    ],
  },
  {
    h: "Cosmetics",
    body: [
      "Native capes and other cosmetics are for fun. Most are free. They have no cash value outside Native, can’t be traded, sold or transferred to another account, and only work on your Native account.",
      "Event capes (for example the Beta Tester cape) are never sold. The Native team gives them out or you can get them with a redeem code. Redeem codes can only be used as described and can’t be exchanged for money.",
    ],
  },
  {
    h: "Purchases and Native+",
    body: [
      "Our order process is conducted by our online reseller Tebex Limited (tebex.io). Tebex is the merchant of record for all our orders and handles payment, tax and receipts. Tebex’s checkout terms also apply to your purchase.",
      "Paid capes: when you buy a cape it stays in your Native locker for as long as your account and the Native cape service exist, unless it’s refunded or charged back.",
      "Native+ is a subscription, billed monthly or yearly in advance, that renews automatically until you cancel. While it’s active you can add every paid Native cape and cosmetic to your locker and you get the Native+ badge. Capes and cosmetics added through Native+ and the badge are removed when the membership ends. You can cancel at any time; you keep Native+ until the end of the period you paid for.",
      "Prices are shown in US dollars before tax. We may change prices for future purchases or renewals; we’ll tell members before a price change affects their renewal.",
      "Refunds are covered by our Refund Policy at nativelaunch.xyz/refunds.",
    ],
  },
  {
    h: "Updates, availability and changes",
    body: [
      "The launcher can update itself and we may change, suspend or discontinue features or services at any time. We try to keep the services reliable but can’t promise they will always be available or free of errors.",
    ],
  },
  {
    h: "Suspension and ending your account",
    body: [
      "We may suspend or end access to the services if you break these terms or put others or the services at risk. You can stop using Native at any time and uninstall the launcher. To have your Native account and its data deleted, ask us through our Discord server.",
    ],
  },
  {
    h: "No warranty",
    body: [
      "Native is provided “as is” and “as available”, without warranties of any kind, to the extent permitted by law. We don’t guarantee that it will be uninterrupted, error-free, or compatible with every system, mod or version of Minecraft.",
    ],
  },
  {
    h: "Limitation of liability",
    body: [
      "To the extent permitted by law, Native and its contributors are not liable for indirect, incidental or consequential damages, or for loss of data, worlds, saves, profits or accounts arising from your use of the launcher or services. Back up the worlds you care about. Nothing in these terms limits liability that can’t be limited by law.",
    ],
  },
  {
    h: "Changes to these terms",
    body: ["We may update these terms from time to time. If we make a significant change we’ll update the date at the top of this page. Continuing to use Native after a change means you accept the updated terms."],
  },
  {
    h: "Contact",
    body: ["Questions about these terms? Reach us through the Support page or our Discord server."],
  },
];

export default function Page() {
  return <Legal title="Terms of Service" path="/terms" updated="October 8, 2026" intro="Plain-language rules for using Native Client and its online services. They’re short, so please read them." sections={sections} />;
}
