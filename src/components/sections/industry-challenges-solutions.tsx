import { HexIcon } from "@/components/ui/hex-icon";

type Card = { title: string; description: string };

type Props = {
  challengesTitle: string;
  challenges: Card[];
  solutionsTitle: string;
  solutions: Card[];
};

export function IndustryChallengesSolutions({
  challengesTitle,
  challenges,
  solutionsTitle,
  solutions,
}: Props) {
  return (
    <section className="bg-white py-10 lg:py-16">
      <div className="container flex flex-col gap-5 lg:flex-row lg:justify-start lg:items-start lg:gap-16">

        {/* Challenges */}
        {/* zinc-100 (#f4f4f5), not neutral-100 — the theme overrides neutral-100 to a near-white #f9fafb */}
        <div className="flex-1 self-stretch p-5 lg:p-7 bg-zinc-100 rounded-xl flex flex-col gap-5 lg:gap-6">
          <h3 className="text-stone-900 text-xl lg:text-2xl font-medium font-montserrat leading-7 lg:leading-8 line-clamp-5">
            {challengesTitle}
          </h3>
          <div className="flex flex-col">
            {challenges.map((c, i) => (
              <div key={i} className="self-stretch py-2.5 lg:py-3 border-b border-neutral-200 last:border-b-0 flex flex-col justify-center items-start gap-1.25">
                <div className="self-stretch inline-flex justify-start items-start gap-1.25">
                  {/* 24px box holding a 12px glyph, so the bullet tops out with the first line of copy */}
                  <span className="size-6 shrink-0 flex items-start justify-center pt-1.75">
                    <HexIcon size={12} color="#d4d4d4" />
                  </span>
                  <p className="flex-1 text-stone-900 text-sm font-medium font-montserrat leading-5">
                    <span className="font-semibold">{c.title}</span>
                    {c.description && ` - ${c.description}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Solutions */}
        {/* brand-50 / primary, not red-50 / red-600 — Tailwind's reds are pink-toned and clash with the #ee3e23 bullets */}
        <div className="flex-1 p-5 lg:p-7 bg-brand-50 rounded-xl flex flex-col gap-5 lg:gap-6">
          <h3 className="text-primary text-xl lg:text-2xl font-medium font-montserrat leading-7 lg:leading-8 line-clamp-5">
            {solutionsTitle}
          </h3>
          <div className="flex flex-col">
            {solutions.map((s, i) => (
              <div key={i} className="self-stretch py-2.5 lg:py-3 border-b border-neutral-200 last:border-b-0 flex flex-col justify-center items-start">
                <div className="self-stretch inline-flex justify-start items-start gap-1.25">
                  <span className="size-6 shrink-0 flex items-start justify-center pt-1.75">
                    <HexIcon size={12} />
                  </span>
                  <p className="flex-1 text-stone-900 text-sm font-medium font-montserrat leading-5">
                    <span className="font-semibold">{s.title}</span>
                    {s.description && ` - ${s.description}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
