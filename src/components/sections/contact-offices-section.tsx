"use client";
import { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTACT_OFFICE_TABS } from "@/lib/contact-data";

export function ContactOfficesSection() {
  const [activeTab, setActiveTab] = useState(CONTACT_OFFICE_TABS[0].id);
  const active = CONTACT_OFFICE_TABS.find((tab) => tab.id === activeTab) ?? CONTACT_OFFICE_TABS[0];

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container flex flex-col gap-10 lg:gap-14">
        <div className="flex flex-col gap-2.5 max-w-176">
          <h2 className="text-neutral-950 text-3xl font-medium font-montserrat leading-10">Connect with Rotex</h2>
          <p className="text-stone-500 text-base font-medium font-montserrat leading-6">
            Locate offices, manufacturing facilities, or the right team for your specific requirement.
          </p>
        </div>

        <div className="border-b border-stone-300 flex items-center gap-5 overflow-x-auto">
          {CONTACT_OFFICE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-2.5 py-5 border-b-2 whitespace-nowrap text-base font-semibold font-montserrat uppercase leading-6 transition-colors",
                tab.id === activeTab ? "border-red-600 text-red-600" : "border-transparent text-stone-900 hover:text-red-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-5">
          {active.offices.map((office) => (
            <div
              key={office.id}
              className="w-full sm:w-90 bg-white rounded-xl outline outline-1 -outline-offset-1 outline-black/10 flex flex-col overflow-hidden"
            >
              <div className="h-2 bg-gradient-orange-radial" />
              <div className="p-6 flex flex-col gap-4">
                <h3 className="text-neutral-950 text-xl font-medium font-montserrat leading-8">{office.name}</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="size-5 text-neutral-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-stone-500 text-sm font-medium font-montserrat leading-5">{office.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-5 text-neutral-400 shrink-0" strokeWidth={1.5} />
                    <p className="text-stone-500 text-sm font-medium font-montserrat leading-5">{office.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-5 text-neutral-400 shrink-0" strokeWidth={1.5} />
                    <p className="text-stone-500 text-sm font-medium font-montserrat leading-5">{office.email}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
