import { ValueIcon } from "@/lib/career-value-icons";

type ValueCard = { icon: string; title: string; description: string };

const VALUES: ValueCard[] = [
  {
    icon: "trending-up",
    title: "Where Growth Comes Together",
    description: "Personal ambitions and career goals align to create meaningful and long-term professional growth.",
  },
  {
    icon: "lightbulb",
    title: "Driven by Innovation",
    description: "We foster an environment that encourages new ideas, creative thinking, and continuous improvement.",
  },
  {
    icon: "rotate-ccw",
    title: "Learning Through Experience",
    description: "Mistakes are treated as opportunities to learn, improve, and grow stronger with every challenge.",
  },
  {
    icon: "badge-check",
    title: "Values-Led Culture",
    description: "A system-driven approach guided by integrity, respect, and care in everything we do.",
  },
  {
    icon: "users",
    title: "Built on Teamwork & Customer Focus",
    description: "Collaboration and a strong customer-first mindset shape how we work and deliver value.",
  },
  {
    icon: "target",
    title: "Growth Through Challenges",
    description: "We encourage curiosity, learning, and the drive to take on challenges that push boundaries.",
  },
];

type CareerValuesSectionProps = {
  heading?: string;
  description?: string;
  values?: ValueCard[];
};

export function CareerValuesSection({
  heading = "Life at Rotex",
  description = "A culture built on learning, collaboration, and continuous improvement, where people grow while creating meaningful impact.",
  values = VALUES,
}: CareerValuesSectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:gap-14">
        <div className="max-w-141.25 flex flex-col gap-3">
          <h2 className="text-stone-900 font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
            {heading}
          </h2>
          <p className="text-zinc-800 font-montserrat font-normal text-base leading-6">{description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {values.map((v) => (
            <div key={v.title} className="flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-gradient-orange-black-radial font-montserrat font-semibold text-xl leading-7">{v.title}</h3>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100">
                  <ValueIcon iconKey={v.icon} />
                </div>
              </div>
              <p className="text-stone-900 font-montserrat font-normal text-base leading-6">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
