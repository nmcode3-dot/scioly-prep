export type ColorPair = {
  badge: string; // bg + text for solid badge
  soft: string; // bg + text for soft chip
  dot: string; // bg color for a dot
  text: string; // text color
};

export const CATEGORY_STYLES: Record<string, ColorPair> = {
  "Life & Personal Science": {
    badge: "bg-emerald-500 text-white",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  },
  "Earth & Space Science": {
    badge: "bg-sky-500 text-white",
    soft: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    text: "text-sky-600",
  },
  "Physical Science & Chemistry": {
    badge: "bg-violet-500 text-white",
    soft: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
    text: "text-violet-600",
  },
  "Inquiry & Nature of Science": {
    badge: "bg-amber-500 text-white",
    soft: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  "Technology & Engineering": {
    badge: "bg-rose-500 text-white",
    soft: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    text: "text-rose-600",
  },
};

export function categoryStyle(category: string): ColorPair {
  return (
    CATEGORY_STYLES[category] ?? {
      badge: "bg-slate-500 text-white",
      soft: "bg-slate-100 text-slate-700 ring-slate-200",
      dot: "bg-slate-500",
      text: "text-slate-600",
    }
  );
}

export const SEASON_META: Record<
  string,
  { label: string; short: string; badge: string; dot: string }
> = {
  "2025": {
    label: "2025 Season (2024–25)",
    short: "2025",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
  "2026": {
    label: "Current · 2025–26 Season",
    short: "2026",
    badge: "bg-brand-100 text-brand-700 ring-brand-200",
    dot: "bg-brand-500",
  },
  "2027": {
    label: "Next Year · 2027 (Projected)",
    short: "2027",
    badge: "bg-accent-400/20 text-accent-500 ring-accent-400/40",
    dot: "bg-accent-500",
  },
};

export const DIFFICULTY_META: Record<
  string,
  { label: string; soft: string; bar: string }
> = {
  easy: {
    label: "Easy",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500",
  },
  medium: {
    label: "Medium",
    soft: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-500",
  },
  hard: {
    label: "Hard",
    soft: "bg-rose-50 text-rose-700 ring-rose-200",
    bar: "bg-rose-500",
  },
  any: {
    label: "Mixed",
    soft: "bg-slate-100 text-slate-600 ring-slate-200",
    bar: "bg-slate-400",
  },
};

export const TYPE_META: Record<string, { label: string; icon: string }> = {
  Study: { label: "Study / Written Test", icon: "📘" },
  Lab: { label: "Lab Event", icon: "🧪" },
  Build: { label: "Build / Engineering", icon: "🔧" },
};

export function divisionLabel(d: string): string {
  return d === "B"
    ? "Division B · Middle School"
    : "Division C · High School";
}
export function divisionShort(d: string): string {
  return d === "B" ? "Div. B" : "Div. C";
}
