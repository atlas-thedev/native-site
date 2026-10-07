import { permanentRedirect } from "next/navigation";

/** The store lives in the Native launcher now. */
export default function Page() {
  permanentRedirect("/store");
}
