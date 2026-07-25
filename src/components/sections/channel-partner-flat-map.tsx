"use client";
import { memo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Plus, Minus, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Partner = { location: string; company: string };
type Pin = { name: string; coordinates: [number, number]; partners: Partner[] };

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const pins: Pin[] = [
  {
    name: "North America",
    coordinates: [-100, 45],
    partners: [{ location: "Canada", company: "Peerless Engineering" }],
  },
  {
    name: "CIS Region",
    coordinates: [70, 58],
    partners: [
      { location: "Kazakhstan", company: "Seastar International LLP" },
      { location: "Uzbekistan", company: "Eurolux" },
      { location: "Azerbaijan", company: "Barama" },
    ],
  },
  {
    name: "Europe",
    coordinates: [15, 50],
    partners: [
      { location: "Poland", company: "Rectus Polska" },
      { location: "Czech Republic", company: "Profitex s.r.o" },
      { location: "Prague", company: "OEM Automatic" },
      { location: "Slovakia", company: "REGADA s.r.o" },
      { location: "Romania", company: "Roconsult Tech SRL" },
      { location: "Lithuania", company: "UAB Skydas" },
      { location: "Turkey", company: "Meteser Otomasyon" },
    ],
  },
  {
    name: "Asia",
    coordinates: [95, 28],
    partners: [
      { location: "Indonesia", company: "PT. Ersada Valve Utama" },
      { location: "Singapore", company: "Bliss Flow Systems (S) Pte Ltd" },
      { location: "Malaysia", company: "Wawansan Gas SDN BHD" },
      { location: "Thailand", company: "HKK Instrumentation Technologies" },
      { location: "Vietnam", company: "Tri Vu Equipment Co. Ltd" },
      { location: "Philippines", company: "ATEX Automation & Technologies Corp." },
      { location: "South Korea", company: "Brantech" },
      { location: "China", company: "Flutech-RTX (Suzhou)" },
      { location: "UAE", company: "Aman Engineering" },
      { location: "Oman", company: "Technical Supplies International" },
      { location: "Qatar", company: "Qatar Hydraulic Co. LLC" },
      { location: "Bahrain", company: "Al Bakali General Trading" },
      { location: "Kuwait", company: "Texel Engineering" },
    ],
  },
  {
    name: "Australia",
    coordinates: [134, -26],
    partners: [{ location: "Australia", company: "Powerflo Solutions Pty Ltd" }],
  },
];

function ChannelPartnerFlatMap() {
  const [openPin, setOpenPin] = useState<string | null>(null);

  return (
    <ComposableMap
      projection="geoEqualEarth"
      projectionConfig={{ scale: 175 }}
      className="w-full h-full"
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#F0DED8"
              stroke="#FFFFFF"
              strokeWidth={0.75}
              style={{
                default: { outline: "none" },
                hover: { outline: "none", fill: "#E8CCC2" },
                pressed: { outline: "none" },
              }}
            />
          ))
        }
      </Geographies>

      {/* Render the open pin last so its popup paints above every other pin/label */}
      {[...pins]
        .sort((a, b) => (a.name === openPin ? 1 : b.name === openPin ? -1 : 0))
        .map((pin) => {
          const isOpen = openPin === pin.name;
          // Pins on the right side of the map would clip their popup off the
          // edge — flip those to open leftward instead.
          const flip = pin.coordinates[0] > 60;
          return (
            <Marker key={pin.name} coordinates={pin.coordinates}>
              <circle r={4} fill="#EF3E23" stroke="#fff" strokeWidth={1} />
              <foreignObject
                x={flip ? -286 : 6}
                y={-12}
                width={280}
                height={380}
                className="overflow-visible"
                style={{ pointerEvents: "none" }}
              >
                <div
                  className={`flex flex-col gap-1.5 ${flip ? "items-end" : "items-start"}`}
                  style={{ pointerEvents: "none" }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenPin(isOpen ? null : pin.name)}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-white px-2.5 py-1 shadow-[0_1px_3px_rgba(0,0,0,0.15)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-shadow"
                    style={{ pointerEvents: "auto" }}
                  >
                    <span className="text-xs font-medium font-montserrat text-stone-800">{pin.name}</span>
                    {isOpen ? (
                      <Minus className="size-3 text-stone-500" strokeWidth={2} />
                    ) : (
                      <Plus className="size-3 text-stone-500" strokeWidth={2} />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ pointerEvents: "auto", transformOrigin: flip ? "top right" : "top left" }}
                        className="w-64 max-h-72 overflow-y-auto rounded-lg bg-white p-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)]"
                      >
                        <ul className="flex flex-col gap-2.5">
                          {pin.partners.map((p) => (
                            <li key={p.location + p.company} className="flex items-start gap-2">
                              <MapPin className="size-3.5 shrink-0 mt-0.5 text-stone-400" strokeWidth={2} />
                              <span className="text-xs font-montserrat leading-4 text-stone-700">
                                <span className="font-semibold text-stone-900">{p.location}</span> - {p.company}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </foreignObject>
            </Marker>
          );
        })}
    </ComposableMap>
  );
}

export default memo(ChannelPartnerFlatMap);
