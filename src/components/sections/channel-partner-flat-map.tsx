"use client";
import { memo, useState } from "react";
import { ComposableMap, ZoomableGroup, Geographies, Geography, Marker } from "react-simple-maps";
import { Plus, Minus, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Pin = {
  name: string;
  stateOrCity?: string | null;
  partnerCompany?: string | null;
  coordinates: [number, number];
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country names below match the exact `properties.name` strings in the
// world-atlas 110m topojson — hovering a region pin highlights every country
// in its list instead of whatever single country happens to sit under the
// cursor. Pins whose name isn't a key here (e.g. a one-off city pin) simply
// get no region highlight, same as before.
const REGION_COUNTRIES: Record<string, string[]> = {
  "North America": [
    "Canada", "United States of America", "Mexico", "Guatemala", "Belize", "Honduras",
    "El Salvador", "Nicaragua", "Costa Rica", "Panama", "Cuba", "Jamaica", "Haiti",
    "Dominican Rep.", "Bahamas", "Trinidad and Tobago", "Puerto Rico", "Greenland",
  ],
  "Europe": [
    "United Kingdom", "Ireland", "France", "Germany", "Spain", "Portugal", "Italy",
    "Netherlands", "Belgium", "Switzerland", "Austria", "Poland", "Czechia", "Slovakia",
    "Hungary", "Romania", "Bulgaria", "Greece", "Sweden", "Norway", "Finland", "Denmark",
    "Iceland", "Estonia", "Latvia", "Lithuania", "Croatia", "Slovenia", "Bosnia and Herz.",
    "Serbia", "Montenegro", "Macedonia", "Albania", "Luxembourg", "Cyprus", "Kosovo", "N. Cyprus",
  ],
  "CIS Region": [
    "Russia", "Kazakhstan", "Belarus", "Ukraine", "Uzbekistan", "Turkmenistan", "Tajikistan",
    "Kyrgyzstan", "Armenia", "Azerbaijan", "Moldova", "Georgia",
  ],
  "Asia": [
    "China", "India", "Japan", "South Korea", "North Korea", "Mongolia", "Vietnam", "Thailand",
    "Myanmar", "Cambodia", "Laos", "Malaysia", "Indonesia", "Philippines", "Bangladesh",
    "Pakistan", "Sri Lanka", "Nepal", "Bhutan", "Afghanistan", "Iran", "Iraq", "Saudi Arabia",
    "United Arab Emirates", "Qatar", "Kuwait", "Oman", "Yemen", "Israel", "Jordan", "Lebanon",
    "Syria", "Turkey", "Brunei", "Palestine", "Taiwan", "Timor-Leste",
  ],
  "Australia": ["Australia", "New Zealand", "Papua New Guinea", "Fiji", "Solomon Is.", "Vanuatu", "New Caledonia"],
};

function ChannelPartnerFlatMap({ pins }: { pins: Pin[] }) {
  const [openPin, setOpenPin] = useState<number | null>(null);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  // Clicking a pin open (e.g. on touch, where there's no hover) keeps its
  // region highlighted too, not just a transient mouse-hover.
  const activePin = hoveredPin ?? openPin;
  const hoveredCountries = activePin !== null ? (REGION_COUNTRIES[pins[activePin]?.name] ?? null) : null;

  return (
    <ComposableMap
      projection="geoEqualEarth"
      projectionConfig={{ scale: 175 }}
      className="w-full h-full touch-pan-x"
    >
      {/* Lets mobile visitors drag/swipe to pan the map — otherwise pins near
          the edges (e.g. Asia, CIS Region) sit partly off the visible area
          with no way to reach them on a touch device. */}
      <ZoomableGroup zoom={2.2} minZoom={1} maxZoom={4} center={[20, 15]}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isRegionHighlighted = hoveredCountries?.includes(geo.properties.name) ?? false;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isRegionHighlighted ? "#EF3E23" : "#F0DED8"}
                  stroke="#FFFFFF"
                  strokeWidth={0.75}
                  style={{
                    default: { outline: "none", transition: "fill 150ms ease" },
                    hover: { outline: "none", fill: isRegionHighlighted ? "#EF3E23" : "#E8CCC2" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Render the open pin last so its popup paints above every other pin/label */}
        {pins
          .map((pin, index) => ({ pin, index }))
          .sort((a, b) => (a.index === openPin ? 1 : b.index === openPin ? -1 : 0))
          .map(({ pin, index }) => {
            const isOpen = openPin === index;
            // Pins on the right side of the map would clip their popup off the
            // edge — flip those to open leftward instead.
            const flip = pin.coordinates[0] > 60;
            const regionCountries = REGION_COUNTRIES[pin.name];
            const detail =
              [pin.stateOrCity, pin.partnerCompany].filter(Boolean).join(" — ") ||
              (regionCountries ? `Covers ${regionCountries.join(", ")}` : "");
            return (
              <Marker
                key={pin.name + index}
                coordinates={pin.coordinates}
                onMouseEnter={() => setHoveredPin(index)}
                onMouseLeave={() => setHoveredPin((cur) => (cur === index ? null : cur))}
              >
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
                      onClick={() => setOpenPin(isOpen ? null : index)}
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
                      {isOpen && detail && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          style={{ pointerEvents: "auto", transformOrigin: flip ? "top right" : "top left" }}
                          className="w-64 rounded-lg bg-white p-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)]"
                        >
                          <p className="flex items-start gap-2">
                            <MapPin className="size-3.5 shrink-0 mt-0.5 text-stone-400" strokeWidth={2} />
                            <span className="text-xs font-montserrat leading-4 text-stone-700">
                              <span className="font-semibold text-stone-900">{pin.name}</span> - {detail}
                            </span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </foreignObject>
              </Marker>
            );
          })}
      </ZoomableGroup>
    </ComposableMap>
  );
}

export default memo(ChannelPartnerFlatMap);
