"use client";
import { motion } from "framer-motion";

type MissionVisionSectionProps = {
  mission?: string;
  vision?: string;
};

const defaultMission =
  "To deliver highly engineered fluid control solutions that make industry run safer, smarter and more efficiently, with an unwavering focus on technology, quality and performance.";

const defaultVision =
  "Providing customers with fluid control automation solutions with utmost safety, efficiency and control to harness the power of fluids.";

function MissionIcon() {
  return (
    <svg width="78" height="73" viewBox="0 0 78 73" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-15 lg:w-20 lg:h-18.25">
      <path d="M2.93337 51.0533C4.92262 55.4576 7.65592 59.3199 11.1367 62.6166C14.6405 65.8892 18.7414 68.448 23.4654 70.2693C28.188 72.0896 33.358 73 39.0007 73C44.6435 73 49.7383 72.0896 54.4863 70.2693C59.2332 68.448 63.3839 65.8892 66.9145 62.6166C70.4441 59.3199 73.1784 55.4576 75.1164 51.0041C77.0549 46.5747 78 41.7281 78 36.4869C78 31.2457 77.0544 26.4001 75.1164 21.9708C73.1779 17.5424 70.468 13.6801 66.9643 10.3824C63.4591 7.08565 59.3328 4.52688 54.536 2.73071C49.7378 0.909415 44.543 0 38.9007 0C33.2584 0 28.1875 0.909415 23.4649 2.73071C18.7414 4.52688 14.6405 7.06053 11.1362 10.3331C7.65542 13.5816 4.92212 17.4439 2.93287 21.9215C0.969494 26.4001 0 31.2467 0 36.4869C0 41.7272 0.969494 46.6491 2.93337 51.0533ZM16.0823 34.6415L25.9509 17.7395C26.5227 16.7798 27.541 16.1887 28.6354 16.1887L48.3712 16.1887C49.5144 16.1887 50.5083 16.7798 51.0547 17.7395L60.9234 34.6415C61.4708 35.6012 61.4708 36.7825 60.9234 37.7171L51.0547 54.6457C50.5088 55.5802 49.5144 56.1704 48.3712 56.1704L28.6354 56.1704C27.5405 56.1704 26.5222 55.5807 25.9509 54.6457L16.0823 37.7171C15.5348 36.7825 15.5348 35.6017 16.0823 34.6415Z" fill="url(#paint0_radial_2799_22356)" />
      <defs>
        <radialGradient id="paint0_radial_2799_22356" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-21.0318 40.0785) rotate(-90) scale(248.416 117.969)">
          <stop stopColor="#FF9A00" />
          <stop offset="0.28" stopColor="#F03900" />
          <stop offset="0.61" stopColor="#950000" />
          <stop offset="0.87" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function VisionIcon() {
  return (
    <svg width="83" height="73" viewBox="0 0 83 73" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-17 h-15 lg:w-21 lg:h-18.25">
      <path fillRule="evenodd" clipRule="evenodd" d="M18.6845 2.83157L0.74633 33.6918C-0.248777 35.4449 -0.248777 37.601 0.74633 39.3073L18.6845 70.2161C19.723 71.9233 21.5739 73 23.5641 73L59.4377 73C61.5157 73 63.3231 71.9224 64.3155 70.2161L82.2537 39.3073C83.2488 37.601 83.2488 35.444 82.2537 33.6918L64.3155 2.83157C63.3222 1.07938 61.5157 0 59.4377 0L23.5641 0C21.5748 0 19.7239 1.07938 18.6845 2.83157Z" fill="url(#paint0_radial_2799_22364)" />
      <defs>
        <radialGradient id="paint0_radial_2799_22364" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-22.38 40.0785) rotate(-90) scale(248.416 125.531)">
          <stop stopColor="#FF9A00" />
          <stop offset="0.28" stopColor="#F03900" />
          <stop offset="0.61" stopColor="#950000" />
          <stop offset="0.87" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function MissionVisionSection({
  mission = defaultMission,
  vision = defaultVision,
}: MissionVisionSectionProps) {
  const cards = [
    { Icon: MissionIcon, title: "Our Mission", body: mission },
    { Icon: VisionIcon, title: "Our Vision", body: vision },
  ];

  return (
    <section className="bg-neutral-100 py-14 lg:py-20">
      {/* Figma: two 522px cards with a 20px gutter = 1064px, centred in the container */}
      <div className="container mx-auto max-w-266 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-5">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white rounded-[20px] border border-neutral-200 p-8 lg:p-10 h-80 md:h-88 lg:h-96 xl:h-105 2xl:h-115 flex flex-col justify-between"
          >
            <card.Icon />
            <div className="flex flex-col gap-5">
              <h3 className="text-stone-900 font-montserrat font-medium text-2xl lg:text-4xl leading-8 lg:leading-10">
                {card.title}
              </h3>
              <p className="text-stone-500 font-montserrat font-medium text-sm lg:text-base leading-6">
                {card.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
