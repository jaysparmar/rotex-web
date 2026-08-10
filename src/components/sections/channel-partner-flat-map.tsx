"use client";
import { memo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Plus, Minus, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Pin = {
  name: string;
  stateOrCity?: string | null;
  partnerCompany?: string | null;
  coordinates: [number, number];
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function ChannelPartnerFlatMap({ pins }: { pins: Pin[] }) {
  const [openPin, setOpenPin] = useState<number | null>(null);

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
      {pins
        .map((pin, index) => ({ pin, index }))
        .sort((a, b) => (a.index === openPin ? 1 : b.index === openPin ? -1 : 0))
        .map(({ pin, index }) => {
          const isOpen = openPin === index;
          // Pins on the right side of the map would clip their popup off the
          // edge — flip those to open leftward instead.
          const flip = pin.coordinates[0] > 60;
          const detail = [pin.stateOrCity, pin.partnerCompany].filter(Boolean).join(" — ");
          return (
            <Marker key={pin.name + index} coordinates={pin.coordinates}>
              <circle r={4} fill="#EE3E23" stroke="#fff" strokeWidth={1} />
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
    </ComposableMap>
  );
}

export default memo(ChannelPartnerFlatMap);
