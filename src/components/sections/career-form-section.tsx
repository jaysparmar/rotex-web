import { JobApplicationForm } from "@/components/sections/job-application-form";

const DEFAULT_BENEFITS = [
  "Work on real, impactful projects",
  "Collaborative and supportive team culture",
  "Opportunities to learn and grow continuously",
  "Exposure to diverse industries and challenges",
  "Space to bring your ideas to life",
  "Transparent and structured work environment",
];

type CareerFormSectionProps = {
  heading?: string;
  description?: string;
  benefits?: string[];
  experienceOptions?: string[];
  positionOptions?: string[];
};

export function CareerFormSection({
  heading = "Start Your Journey With Us",
  description = "Share your details and portfolio, our team will get in touch with you",
  benefits = DEFAULT_BENEFITS,
  experienceOptions,
  positionOptions,
}: CareerFormSectionProps) {
  return (
    <section id="form" className="scroll-mt-24 lg:scroll-mt-32 bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left copy */}
        <div className="lg:w-121.75 lg:shrink-0 flex flex-col gap-14">
          <div className="flex flex-col gap-2">
            <h2 className="text-neutral-950 text-2xl lg:text-3xl font-medium font-montserrat leading-9 lg:leading-10">
              {heading}
            </h2>
            <p className="max-w-80 text-stone-500 text-base font-medium font-montserrat leading-6">
              {description}
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-1.5 size-2.5 shrink-0 bg-red-600" />
                <span className="text-zinc-800 text-sm font-medium font-montserrat leading-5">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <JobApplicationForm
          className="flex-1"
          experienceOptions={experienceOptions}
          positionOptions={positionOptions}
        />
      </div>
    </section>
  );
}
