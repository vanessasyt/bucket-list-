import { TYPE_INK, type EntryType } from "@/lib/types";

// A deterministic tilt per stamp, so the same entry always prints at the
// same angle on the server and after hydration. Math.random() here would
// cause a hydration mismatch.
export function tiltFor(seed: string, spread = 7): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((Math.abs(hash) % 1000) / 1000) * spread * 2 - spread;
}

function shortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${d} ${months[Number(m) - 1]} ${y.slice(2)}`;
}

export default function Stamp({
  title,
  type,
  city,
  date,
  size = "md",
  seed,
  animate = false,
}: {
  title: string;
  type: EntryType;
  city: string;
  date: string;
  size?: "sm" | "md" | "lg";
  seed?: string;
  animate?: boolean;
}) {
  const ink = TYPE_INK[type];
  const tilt = tiltFor(seed ?? `${title}${date}`);

  const dims = {
    sm: { box: "w-[74px] h-[74px] px-1", city: "text-[7px]", title: "text-[8px]", date: "text-[6px]" },
    md: { box: "w-[110px] h-[110px] px-2", city: "text-[9px]", title: "text-[11px]", date: "text-[8px]" },
    lg: { box: "w-[150px] h-[150px] px-3", city: "text-[11px]", title: "text-[14px]", date: "text-[10px]" },
  }[size];

  return (
    <div
      className={`stamp stamp-${type} ${ink.text} ${ink.border} ${dims.box} ${
        animate ? "animate-stamp" : ""
      }`}
      style={
        {
          "--stamp-rot": `${tilt}deg`,
          transform: `rotate(${tilt}deg)`,
        } as React.CSSProperties
      }
    >
      <span className={`${dims.city} tracking-[0.2em] opacity-80`}>{city}</span>
      <span className={`${dims.title} font-semibold leading-tight my-0.5 line-clamp-3`}>
        {title}
      </span>
      <span className={`${dims.date} tracking-[0.12em] opacity-75`}>{shortDate(date)}</span>
    </div>
  );
}
