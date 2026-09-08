"use client";
import { memo } from "react";
import { ComposableMap, Geographies, Geography, Marker, Sphere } from "react-simple-maps";

type Pin = { name: string; coordinates: [number, number] };

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type TrustedWorldMapProps = {
  rotateLng?: number;
  rotateLat?: number;
  pins: Pin[];
};

function TrustedWorldMap({ rotateLng = -55, rotateLat = -18, pins }: TrustedWorldMapProps) {
  return (
    // Square viewBox with radius 380 centred at 400,400 — the globe spans 20..780
    // on both axes, so nothing is clipped at the left, right or top edge.
    <ComposableMap
      projection="geoOrthographic"
      width={800}
      height={800}
      projectionConfig={{ scale: 380, rotate: [rotateLng, rotateLat, 0] }}
      className="w-full h-full"
    >
      <Sphere id="globe-sphere" fill="#F5F5F6" stroke="none" strokeWidth={0} />
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#E4E4E7"
              stroke="#FFFFFF"
              strokeWidth={0.75}
              style={{
                default: { outline: "none" },
                hover: { outline: "none", fill: "#D4D4D8" },
                pressed: { outline: "none" },
              }}
            />
          ))
        }
      </Geographies>

      {pins.map((pin) => (
        <Marker key={pin.name} coordinates={pin.coordinates}>
          <circle r={5} fill="#EF3E23" stroke="#fff" strokeWidth={1.5} />
          <foreignObject x={-100} y={-34} width={200} height={26} className="pointer-events-none overflow-visible">
            <div className="flex justify-center">
              <span className="whitespace-nowrap rounded bg-white/90 px-2 py-0.5 text-sm font-semibold font-montserrat text-[#EF3E23]">
                {pin.name}
              </span>
            </div>
          </foreignObject>
        </Marker>
      ))}
    </ComposableMap>
  );
}

export default memo(TrustedWorldMap);
