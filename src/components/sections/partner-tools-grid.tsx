"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Tool = { icon: string; title: string; description: string; link: string };
type HeroData = { title: string; description: string };
type ToolsData = { tools: Tool[] };

const DEFAULT_HERO: HeroData = {
  title: "Rotex Automation Sales tools",
  description: "Access all your essential sales and customer service tools in one place.",
};

/* Fallback artwork for tools without a configured icon. */
function ToolIconPlaceholder() {
  return (
    <svg width="80" height="74" viewBox="0 0 14 13" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.1516 0.504252L0.125887 5.99991C-0.0419623 6.31211 -0.0419623 6.69606 0.125887 6.99993L3.1516 12.5042C3.32677 12.8083 3.63897 13 3.97467 13L10.0256 13C10.3761 13 10.681 12.8081 10.8484 12.5042L13.8741 6.99993C14.042 6.69606 14.042 6.31195 13.8741 5.99991L10.8484 0.504252C10.6809 0.192218 10.3761 0 10.0256 0L3.97467 0C3.63912 0 3.32692 0.192218 3.1516 0.504252Z"
        fill="#EF3E23"
        opacity="0.2"
      />
    </svg>
  );
}

export function PartnerToolsGrid() {
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    fetch("/api/v1/partner-tools/hero")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.enabled !== false) setHero(json.data);
      })
      .catch(() => {});

    fetch("/api/v1/partner-tools/tools")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.enabled !== false) setTools(json.data.tools ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Hero — Figma: h-96, content bottom-aligned within the shared container */}
      <section className="bg-stone-900 pt-26 lg:pt-28 pb-10 lg:pb-20 lg:h-96 flex flex-col justify-end items-start">
        <div className="container flex flex-col justify-center items-start gap-3 lg:gap-5">
          <h1 className="lg:w-143 text-gradient-hero font-montserrat font-normal text-3xl lg:text-6xl leading-10 lg:leading-14.25">
            {hero.title}
          </h1>
          <p className="lg:w-143 text-white font-montserrat font-normal text-sm lg:text-base leading-5 lg:leading-6">
            {hero.description}
          </p>
        </div>
      </section>

      {/* Tool cards */}
      <section className="bg-white py-14 lg:py-20">
        <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool, i) => (
            <div
              key={i}
              className="bg-white rounded-xl outline-1 -outline-offset-1 outline-neutral-200 flex flex-col overflow-hidden"
            >
              <div className="py-10 flex items-center justify-center">
                {tool.icon ? (
                  <Image src={tool.icon} alt={tool.title} width={80} height={74} className="object-contain" unoptimized />
                ) : (
                  <ToolIconPlaceholder />
                )}
              </div>

              <div className="flex-1 p-5 bg-zinc-100 flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-stone-900 font-montserrat font-semibold text-base leading-6">
                    {tool.title}
                  </h2>
                  <p className="text-stone-500 font-montserrat font-medium text-sm leading-5">
                    {tool.description}
                  </p>
                </div>

                {/* External portal — opens in a new tab */}
                <a
                  href={tool.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit px-5 py-3 bg-white rounded-[45px] inline-flex items-center gap-1.5 text-stone-900 font-montserrat font-medium text-sm leading-5 hover:bg-primary hover:text-white transition-colors duration-150"
                >
                  Open Tool
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M4 2.5 7.5 6 4 9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
