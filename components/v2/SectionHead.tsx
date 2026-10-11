import SplitText from "../SplitText";

/** Editorial section header: index + label on a hairline, then a huge display title. */
export default function SectionHead({ index, label, title, sub, align = "left", id }: { index: string; label: string; title: string; sub?: React.ReactNode; align?: "left" | "center"; id?: string }) {
  return (
    <header id={id} className={`v-head ${align === "center" ? "is-center" : ""}`}>
      <div className="v-head-rule">
        <span>{label}</span>
      </div>
      <SplitText as="h2" text={title} className="v-display v-h2" stagger={0.05} />
      {sub && <p className="v-head-sub">{sub}</p>}
    </header>
  );
}
