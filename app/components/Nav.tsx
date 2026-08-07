import Link from "next/link";
import { logout } from "../actions";
import { PERSON_LABELS, type Person } from "@/lib/types";

export default function Nav({
  person,
  active,
}: {
  person: Person;
  active: "map" | "list" | "add";
}) {
  const link = (href: string, key: string, label: string) => (
    <Link
      href={href}
      className={`font-mono text-[11px] tracking-[0.16em] uppercase px-3 py-1.5 rounded-sm transition-colors ${
        active === key ? "bg-page text-navy" : "text-page/70 hover:text-page"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-navy px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 shrink-0">
      <Link href="/" className="min-w-0">
        <span className="font-display text-xl sm:text-2xl font-black text-page tracking-wide whitespace-nowrap">
          TUDOR &amp; VANESSA
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        {link("/", "map", "Map")}
        {link("/list", "list", "List")}
        {link("/add", "add", "Log")}
      </nav>

      <form action={logout} className="hidden sm:block">
        <button
          type="submit"
          className="font-mono text-[10px] tracking-[0.14em] uppercase text-page/50 hover:text-page/90"
        >
          {PERSON_LABELS[person]} ↪
        </button>
      </form>
    </header>
  );
}
