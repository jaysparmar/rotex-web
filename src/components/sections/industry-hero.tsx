import Image, { type StaticImageData } from "next/image";

type Props = {
  name: string;
  description: string;
  bg: StaticImageData | string;
};

export function IndustryHero({ name, description, bg }: Props) {
  return (
    <div className="relative w-full min-h-72 lg:min-h-160 overflow-hidden">
      <Image src={bg} alt={name} fill className="object-cover object-center" />
      <div className="absolute inset-0 bg-linear-0 from-black/90 to-black/0" />
      <div className="relative min-h-72 lg:min-h-160 flex items-end">
        <div className="container pt-16 pb-6 lg:pb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 lg:gap-8">
          <h2 className="text-white text-2xl lg:text-4xl font-medium font-montserrat leading-8 lg:leading-10">
            {name}
          </h2>
          <p className="lg:max-w-131 text-subtext text-sm lg:text-base font-medium font-montserrat leading-5 lg:leading-6">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
