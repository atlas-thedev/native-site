/**
 * The project used to be called Noctra. Older commit messages and release notes still say so,
 * so the site shows them under the current name. URLs are left untouched.
 */
export function rebrand(text: string): string {
  return text
    .split(/(https?:\/\/\S+)/)
    .map((part, i) => (i % 2 ? part : part.replace(/\bnoctra\b/gi, "Native")))
    .join("");
}
