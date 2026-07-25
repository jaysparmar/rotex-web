type AwardsHeroSectionProps = {
  title?: string;
  description?: string;
};

export function AwardsHeroSection({
  title = "Awards & Recognition",
  description = "Celebrating excellence and innovation in industrial automation. Our commitment to quality and technological advancement has earned recognition from leading organizations worldwide.",
}: AwardsHeroSectionProps) {
  return (
    <section className="bg-stone-900 px-6 pt-28 pb-14 lg:px-20 lg:pt-32 lg:pb-20">
      <div className="flex flex-col gap-6">
        <h1 className="text-gradient-hero text-3xl lg:text-5xl font-normal font-montserrat leading-tight lg:leading-[58px]">
          {title}
        </h1>
        <p className="max-w-163.5 text-white text-base font-normal font-montserrat leading-6">
          {description}
        </p>
      </div>
    </section>
  );
}
