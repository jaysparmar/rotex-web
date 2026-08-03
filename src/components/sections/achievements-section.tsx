"use client";
import { useId } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy } from "lucide-react";

type Achievement = { badge: "rail" | "zed" | "trophy"; text: string };

type AchievementsSectionProps = {
  heading?: string;
  achievements?: Achievement[];
  cta?: { label: string; href: string };
};

const defaultAchievements: Achievement[] = [
  {
    badge: "rail",
    text: 'Featured as one of the "100 Innovative Companies in the Rail Sector of India".',
  },
  {
    badge: "zed",
    text: "Quality and compliance recognition for the manufacturing unit.",
  },
  {
    badge: "trophy",
    text: '1st Runner-Up at the National-Level Indian Society for Quality (ISQ) Competition for the "Aarambh" Case Study.',
  },
];

function LaurelLeaf({ className = "", flipped = false }: { className?: string; flipped?: boolean }) {
  const gradientId = useId();
  return (
    <svg
      width="38"
      height="67"
      viewBox="0 0 38 67"
      fill="none"
      aria-hidden
      className={`${flipped ? "-scale-x-100" : ""} ${className}`}
    >
      <defs>
        <radialGradient
          id={gradientId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(19 33.5) rotate(90) scale(33.5 19)"
        >
          <stop stopColor="#E5AD5C" />
          <stop offset="0.5" stopColor="#D29235" />
          <stop offset="1" stopColor="#E5AD5C" />
        </radialGradient>
      </defs>
      <path
        d="M24.6699 8.6723C24.4959 8.45929 24.1723 8.42005 23.9471 8.58465C18.7804 12.3617 14.5643 17.3415 12.3145 23.2015C9.16345 31.4092 9.33362 41.5587 12.8577 50.0492C16.3857 58.5491 23.3048 65.442 33.6792 66.9939C33.9602 67.036 34.2241 66.8545 34.2685 66.5886C34.3129 66.3227 34.1212 66.0731 33.8401 66.0311C23.9163 64.5466 17.2482 57.9598 13.8169 49.6928C10.3816 41.4164 10.2204 31.512 13.2831 23.5343C15.4557 17.8754 19.5386 13.0395 24.5772 9.35607C24.8024 9.19147 24.8439 8.88532 24.6699 8.6723Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M25.8957 64.2075C25.8957 64.2075 30.7775 56.7647 23.6669 46.1841C23.3996 46.7505 19.9039 56.0207 25.8957 64.2075Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M21.2393 61.1878C21.2393 61.1878 12.2908 63.4353 3.66595 53.9153C4.31649 53.838 14.7096 53.3793 21.2393 61.1878Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M13.3774 50.4202C13.3774 50.4202 4.19371 49.3106 0 37.4155C0.632866 37.5754 10.4417 40.8584 13.3774 50.4202Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M10.4209 38.4749C10.4209 38.4749 2.10082 34.6318 2.1704 22.0931C2.71491 22.438 10.8892 28.5276 10.4209 38.4749Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M11.7485 25.8349C11.7485 25.8349 4.8223 20.0222 8.44057 7.96102C8.868 8.43122 15.0177 16.3703 11.7485 25.8349Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M16.0403 16.8384C16.0403 16.8384 12.1239 9.3058 19.642 0C19.8431 0.562151 22.3127 9.68718 16.0392 16.8384H16.0403Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M16.5585 56.0574C16.5585 56.0574 24.0965 49.5874 20.3446 36.59C19.8741 37.1051 13.1721 45.4507 16.5585 56.0574Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M11.0934 41.5585C11.0934 41.5585 18.9971 37.3184 19.2942 24.6773C18.7276 25.043 11.1122 30.6875 11.0934 41.5585Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M18.6426 15.7664C20.9079 14.2095 23.5145 13.1364 26.2039 12.3998C26.1983 12.9275 26.121 13.4541 25.9763 13.964C25.7963 14.5951 25.5114 15.1959 25.1988 15.7779C22.6938 20.434 17.6033 24.8444 12.0455 25.8778C12.0632 25.2854 12.4862 24.4923 12.6607 23.9114C13.668 20.5531 15.6362 17.8332 18.6437 15.7664H18.6426Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M24.8233 7.60367C28.5155 4.78037 33.2471 3.19945 37.9953 3.20468C38.109 4.61632 36.1431 5.92035 35.1126 6.657C32.7534 8.34449 30.2716 9.49387 27.3868 10.2305C25.6107 10.684 23.615 11.0487 21.7716 11.0455C21.7164 11.0455 21.6534 11.0414 21.6203 11.0006C21.5717 10.9421 21.6181 10.8575 21.6644 10.7969C22.0289 10.3183 22.5005 9.92332 22.8838 9.45835C23.457 8.76349 24.0998 8.15746 24.8244 7.60367H24.8233Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

function AchievementBadge({ badge }: { badge: Achievement["badge"] }) {
  if (badge === "rail") {
    return (
      <div className="flex h-full w-full items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white px-4">
        <div className="font-montserrat font-extrabold text-red-600 leading-tight text-left">
          <p className="text-sm lg:text-base">RAIL ANALYSIS</p>
          <p className="text-sm lg:text-base">INNOVATION</p>
          <p className="mt-1 text-[10px] font-medium italic text-stone-400">2025 Edition</p>
        </div>
        <p className="font-montserrat font-extrabold text-3xl lg:text-4xl text-stone-800">100</p>
      </div>
    );
  }

  if (badge === "zed") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-stone-200 bg-orange-50/60 px-4 text-center">
        <p className="font-serif font-bold text-lg lg:text-xl tracking-wide text-red-700">ZED BRONZE</p>
        <p className="font-serif text-[10px] italic text-stone-500 max-w-55">
          under MSME Sustainable (ZED) Certification Scheme awarded to
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-linear-to-b from-stone-200 to-stone-300">
      <Trophy className="size-14 text-white drop-shadow" strokeWidth={1.5} />
    </div>
  );
}

export function AchievementsSection({
  heading = "What We Achieved So Far",
  achievements = defaultAchievements,
  cta = { label: "See More of Our Wins", href: "/about/awards" },
}: AchievementsSectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <h2 className="text-stone-900 font-montserrat font-normal text-2xl lg:text-4xl leading-8 lg:leading-10 mb-10 lg:mb-14 text-center">
          {heading}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {achievements.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="flex items-center justify-center gap-3 lg:gap-4">
                <LaurelLeaf className="shrink-0" />
                <div className="h-32 w-52 lg:h-36 lg:w-60 shrink-0">
                  <AchievementBadge badge={a.badge} />
                </div>
                <LaurelLeaf flipped className="shrink-0" />
              </div>
              <p className="text-stone-500 font-montserrat font-medium text-sm leading-6 max-w-xs">{a.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-10 lg:mt-14">
          <Link
            href={cta.href}
            className="w-full lg:w-auto inline-flex justify-center items-center gap-3.5 px-6 py-3.5 rounded-[47px] lg:rounded-full bg-stone-900 text-white font-montserrat font-bold lg:font-semibold text-sm uppercase leading-5 shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] hover:bg-primary transition-colors duration-150"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
