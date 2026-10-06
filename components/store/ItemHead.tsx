import { ArrowLeft } from "lucide-react";
import { PxLink } from "../ui/Px";
import { Crumbs } from "./StoreHero";

/** Top of an item page: breadcrumb, back button and the title. */
export default function ItemHead({ trail, back, title }: { trail: { label: string; href?: string }[]; back: string; title: string }) {
  return (
    <div className="mb-5">
      <Crumbs trail={trail} />
      <div className="mt-3 flex items-center gap-4">
        <PxLink href={back} variant="ghost" icon title="Back"><ArrowLeft /></PxLink>
        <h1 className="min-w-0 truncate text-[clamp(1.9rem,3.6vw,2.6rem)] font-extrabold leading-none tracking-[-0.035em]">{title}</h1>
      </div>
    </div>
  );
}
