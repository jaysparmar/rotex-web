type WhyCard = { title: string; points: string[] };

const CARDS: WhyCard[] = [
  {
    title: "Proven Global Growth Engine",
    points: [
      "10,000+ qualified industrial leads generated",
      "Channel partners achieving 35% YoY growth",
      "Typical distributor margins: 17–20%",
      "ROI potential up to 57% with optimized inventory programs",
    ],
  },
  {
    title: "Engineering-Driven Product Portfolio",
    points: [
      "Solenoid valves: 2/2, 3/2, 5/2 configurations",
      "Explosion-proof, intrinsically safe, and NAMUR designs",
      "Electro-hydraulic actuators & positioners",
      "Designed for hazardous, high-pressure, and high-temperature applications",
    ],
  },
  {
    title: "Strong Technical Differentiation",
    points: [
      "Coil insulation: Class F (155°C) / Class H (180°C)",
      "Protection: IP65 / IP67",
      "Materials: Brass, SS304, SS316 (corrosion-resistant applications)",
      "Precision orifice control (~1 mm to 5 mm)",
    ],
  },
];

type ChannelPartnerWhySectionProps = {
  heading?: string;
  description?: string;
  cards?: WhyCard[];
};

export function ChannelPartnerWhySection({
  heading = "Why Global Distributors Choose Rotex",
  description = "Rotex is positioned as a technology-driven manufacturer, enabling channel partners to compete in technically demanding and compliance-heavy industries.",
  cards = CARDS,
}: ChannelPartnerWhySectionProps) {
  return (
    <section className="bg-stone-50 py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:gap-16">
        {/* Heading — pinned while cards scroll past */}
        <div className="lg:w-96 lg:shrink-0">
          <div className="lg:sticky lg:top-32 flex flex-col gap-3">
            <h2 className="text-stone-900 font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
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
              <div className="rounded-xl bg-white p-7 shadow-[0px_-4px_0px_0px_rgba(239,62,35,1.00)] flex flex-col gap-6">
                <h3 className="text-gradient-hero font-montserrat font-semibold text-xl leading-7">
                  {card.title}
                </h3>
                <ul className="flex flex-col gap-4">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-1.5 ml-1.5 size-3 shrink-0 bg-neutral-200" />
                      <span className="flex-1 text-stone-900 font-montserrat font-medium text-base leading-6">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
