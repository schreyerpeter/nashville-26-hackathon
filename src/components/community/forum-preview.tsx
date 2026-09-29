// A small, static picture of what the forum looks like inside, so the landing page shows
// the community rather than only describing it. The topics are the seeded sample content.

type Tone = "coastal" | "seafoam" | "amber";

const chip: Record<Tone, string> = {
  coastal: "border-coastal-blue-30 bg-coastal-blue-10 text-coastal-blue-80",
  seafoam: "border-seafoam-30 bg-seafoam-10 text-seafoam-80",
  amber: "border-amber-30 bg-amber-10 text-amber-80",
};

const avatarTone = ["bg-amber-50", "bg-seafoam-50", "bg-coastal-blue-50", "bg-red-40"];

const topics: { title: string; category: string; emoji: string; tone: Tone; replies: number; members: number }[] = [
  { title: "Six weeks of showing up to every visit", category: "Wins", emoji: "🎉", tone: "seafoam", replies: 3, members: 4 },
  { title: "Taking video visits from work without anyone overhearing", category: "Visits and refills", emoji: "💬", tone: "coastal", replies: 2, members: 3 },
  { title: "What helps on the hard evenings?", category: "Day to day", emoji: "🌅", tone: "amber", replies: 2, members: 3 },
];

function Avatars({ count, offset }: { count: number; offset: number }) {
  return (
    <span className="flex">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`grid size-7 place-items-center rounded-full border-2 border-white text-scale-2 font-semibold text-white ${
            avatarTone[(i + offset) % avatarTone.length]
          } ${i > 0 ? "-ml-sp-1" : ""}`}
        >
          P
        </span>
      ))}
    </span>
  );
}

export function ForumPreview() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute -inset-sp-3 -z-10 rounded-full bg-coastal-blue-20 opacity-60 blur-3xl" />
      <div className="grid gap-sp-1.5 rounded-larger border border-border-medium bg-app-background p-sp-2 shadow-float-small">
        <div className="flex items-center justify-between px-sp-0.5">
          <span className="text-scale-3 font-semibold text-text-dark">Latest</span>
          <span className="text-scale-2 text-text-light">A peek inside</span>
        </div>
        <ul className="grid gap-sp-1.5" aria-label="Sample conversations">
          {topics.map(({ title, category, emoji, tone, replies, members }, i) => (
            <li
              key={title}
              className="flex items-center gap-sp-2 rounded-large border border-border-medium bg-surface-default p-sp-2 shadow-hover-small"
            >
              <div className="grid min-w-0 flex-1 gap-sp-1">
                <span className="text-scale-4.5 font-semibold text-text-dark">{title}</span>
                <span
                  className={`inline-flex w-fit items-center gap-sp-0.5 rounded-full border px-sp-1.5 py-sp-0.25 text-scale-2 font-semibold ${chip[tone]}`}
                >
                  <span aria-hidden="true">{emoji}</span>
                  {category}
                </span>
              </div>
              <div className="grid shrink-0 justify-items-end gap-sp-0.5">
                <Avatars count={members} offset={i} />
                <span className="text-scale-2 text-text-light">
                  {replies} {replies === 1 ? "reply" : "replies"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
