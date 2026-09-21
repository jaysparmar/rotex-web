import { ValueIcon } from "@/lib/career-value-icons";

/** Hexagon icon background — exact Figma path, sized to fit the icon centered inside. */
function HexIconBg({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex size-9.5 shrink-0 items-center justify-center">
      <svg
        width="38"
        height="33"
        viewBox="0 0 38 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.39774 1.28002L0.335438 15.2306C-0.111813 16.023 -0.111813 16.9977 0.335438 17.769L8.39774 31.7415C8.8645 32.5133 9.69639 33 10.5909 33H26.7143C27.6482 33 28.4606 32.5129 28.9066 31.7415L36.9689 17.769C37.4162 16.9977 37.4162 16.0226 36.9689 15.2306L28.9066 1.28002C28.4602 0.487939 27.6482 0 26.7143 0L10.5909 0C9.6968 0 8.86491 0.487939 8.39774 1.28002Z"
          fill="#F1F1F1"
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

type ValueCard = { icon: string; title: string; description: string };

const VALUES: ValueCard[] = [
  {
    icon: "/icons/values/trending-up.svg",
    title: "Where Growth Comes Together",
    description: "Personal ambitions and career goals align to create meaningful and long-term professional growth.",
  },
  {
    icon: "/icons/values/lightbulb.svg",
    title: "Driven by Innovation",
    description: "We foster an environment that encourages new ideas, creative thinking, and continuous improvement.",
  },
  {
    icon: "/icons/values/rotate-ccw.svg",
    title: "Learning Through Experience",
    description: "Mistakes are treated as opportunities to learn, improve, and grow stronger with every challenge.",
  },
  {
    icon: "/icons/values/badge-check.svg",
    title: "Values-Led Culture",
    description: "A system-driven approach guided by integrity, respect, and care in everything we do.",
  },
  {
    icon: "/icons/values/users.svg",
    title: "Built on Teamwork & Customer Focus",
    description: "Collaboration and a strong customer-first mindset shape how we work and deliver value.",
  },
  {
    icon: "/icons/values/target.svg",
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
              <div className="flex flex-col items-start gap-3">
                <HexIconBg>
                  <ValueIcon icon={v.icon} />
                </HexIconBg>
                <h3 className="text-gradient-orange-black-radial font-montserrat font-semibold text-xl leading-7">{v.title}</h3>
              </div>
              <p className="text-stone-900 font-montserrat font-normal text-base leading-6">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
