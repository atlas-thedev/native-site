/** SignPath attribution shared by the download page and site footer. */
export default function CodeSigningCredit({ className = "" }: { className?: string }) {
  const link = "text-fg underline decoration-dim underline-offset-4 transition hover:decoration-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <p data-code-signing-credit className={`text-sm leading-relaxed text-mute ${className}`}>
      Free code signing provided by <a className={link} href="https://about.signpath.io" target="_blank" rel="noopener noreferrer">SignPath.io</a>, certificate by <a className={link} href="https://signpath.org" target="_blank" rel="noopener noreferrer">SignPath Foundation</a>.{" "}
      <a className={link} href="https://github.com/atlas-thedev/native-client#code-signing-policy" target="_blank" rel="noopener noreferrer">Code signing policy</a>
    </p>
  );
}
