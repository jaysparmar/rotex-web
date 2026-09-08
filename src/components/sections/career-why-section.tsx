import { Wrench } from "lucide-react";

type WhyCard = { title: string; description: string; image?: string };

const CARDS: WhyCard[] = [
  {
    title: "Purpose-driven engineering",
    description:
      "At Rotex, every solution is built to solve real industrial challenges. Work here directly contributes to systems that improve reliability, safety, and efficiency across industries.",
    image: "/media/career/1.png",
  },
  {
    title: "Ownership from day one",
    description:
      "We believe in trusting people early. You are encouraged to take responsibility, make decisions, and learn through real projects rather than passive observation.",
    image: "/media/career/2.png",
  },
  {
    title: "Continuous learning culture",
    description:
      "Growth is part of the work, not separate from it. Teams learn by building, experimenting, and improving together in a structured and supportive environment.",
    image: "/media/career/3.png",
  },
  {
    title: "Precision in everything we do",
    description:
      "Attention to detail defines our approach. From design to execution, every step is guided by accuracy, quality, and system-level thinking.",
    image: "/media/career/4.png",
  },
  {
    title: "Collaborative environment",
    description:
      "We work as one team across functions. Ideas are shared openly, feedback is valued, and collaboration drives better outcomes.",
    image: "/media/career/5.png",
  },
  {
    title: "Impact that matters",
    description:
      "The work you do here goes beyond screens and systems. It supports industries that power everyday life, making your contribution meaningful and visible.",
    image: "/media/career/6.png",
  },
];

type CareerWhySectionProps = {
  heading?: string;
  description?: string;
  cards?: WhyCard[];
};

export function CareerWhySection({
  heading = "Why Work at Rotex",
  description = "Build practical solutions, learn continuously, and contribute to systems that power industries.",
  cards = CARDS,
}: CareerWhySectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:gap-16">
        {/* Heading — pinned while cards scroll past */}
        <div className="lg:w-96 lg:shrink-0">
          <div className="lg:sticky lg:top-32 flex flex-col gap-3">
            <h2 className="text-gradient-hero font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
              {heading}
            </h2>
            <p className="text-stone-500 font-montserrat font-medium text-sm lg:text-base leading-6">
              {description}
            </p>
          </div>
        </div>

        {/* Stacking cards */}
        <div className="flex-1 flex flex-col gap-8">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className="lg:sticky"
              style={{ top: `calc(8rem + ${i * 5}rem)`, zIndex: i + 1 }}
            >
              <div className="rounded-2xl bg-white outline outline-1 -outline-offset-1 outline-neutral-200 shadow-[0px_-4px_0px_0px_rgba(239,62,35,1.00)] flex flex-col-reverse lg:flex-row items-center overflow-hidden">
                <div className="flex-1 self-stretch p-8 lg:p-12 flex flex-col justify-between gap-3">
                  <h3 className="max-w-64 text-gradient-highlight font-montserrat font-medium text-2xl leading-8">
                    {card.title}
                  </h3>
                  <p className="text-zinc-800/80 font-montserrat font-medium text-base leading-6">
                    {card.description}
                  </p>
                </div>

                <div className="relative w-full h-56 lg:w-80 lg:h-80 shrink-0 lg:m-5 lg:rounded-2xl overflow-hidden">
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-orange-100 to-stone-200">
                      <Wrench className="size-12 text-stone-400" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
