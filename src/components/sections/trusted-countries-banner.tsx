"use client";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useCallback, useRef, useState } from "react";

const DRAG_SENSITIVITY = 0.35;
const BASE_LAT = -18;
const LAT_MIN = -75;
const LAT_MAX = 60;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const TrustedWorldMap = dynamic(() => import("./trusted-world-map"), {
  ssr: false,
  loading: () => <div className="w-full h-full rounded-full bg-neutral-100 animate-pulse" />,
});

type TrustedCountriesBannerProps = {
  title?: string;
  description?: string;
};

export function TrustedCountriesBanner({
  title = "Trusted across 81 countries.",
  description = "From North Sea offshore platforms to Qatar gas fields, German cleanrooms, and Indian cement plants, Rotex is specified where precision matters and failure is not allowed.",
}: TrustedCountriesBannerProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rawRotate = useTransform(scrollYProgress, [0, 1], [-75, -35]);

  const [scrollRotate, setScrollRotate] = useState(-55);
  const lastScrollRotate = useRef(-55);
  useMotionValueEvent(rawRotate, "change", (v) => {
    const rounded = Math.round(v * 10) / 10;
    if (Math.abs(rounded - lastScrollRotate.current) >= 0.1) {
      lastScrollRotate.current = rounded;
      setScrollRotate(rounded);
    }
  });

  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    pointerX: number;
    pointerY: number;
    rafId: number | null;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    pointerX: 0,
    pointerY: 0,
    rafId: null,
  });

  const applyDragFrame = useCallback(() => {
    const s = dragState.current;
    if (!s.dragging) {
      s.rafId = null;
      return;
    }
    const deltaX = s.pointerX - s.startX;
    const deltaY = s.pointerY - s.startY;
    setDragOffsetX(s.startOffsetX + deltaX * DRAG_SENSITIVITY);
    setDragOffsetY(
      clamp(s.startOffsetY - deltaY * DRAG_SENSITIVITY, LAT_MIN - BASE_LAT, LAT_MAX - BASE_LAT)
    );
    s.rafId = requestAnimationFrame(applyDragFrame);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = {
      ...dragState.current,
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      pointerX: e.clientX,
      pointerY: e.clientY,
      startOffsetX: dragOffsetX,
      startOffsetY: dragOffsetY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (dragState.current.rafId === null) {
      dragState.current.rafId = requestAnimationFrame(applyDragFrame);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    dragState.current.pointerX = e.clientX;
    dragState.current.pointerY = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.dragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const rotateLng = scrollRotate + dragOffsetX;
  const rotateLat = BASE_LAT + dragOffsetY;

  return (
    <section ref={sectionRef} className="bg-white py-16 lg:py-20 overflow-hidden">
      <div className="container flex flex-col items-center text-center gap-3">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="self-start lg:self-auto text-left lg:text-center text-stone-900 font-montserrat font-medium text-2xl lg:text-3xl leading-8 lg:leading-10 max-w-xl"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone-500 font-montserrat font-medium text-sm lg:text-base leading-6 max-w-xl"
        >
          {description}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative mx-auto mt-10 lg:mt-14 w-full max-w-3xl aspect-[2/1] overflow-hidden"
      >
        <div
          className="absolute inset-x-0 top-0 aspect-square cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <TrustedWorldMap rotateLng={rotateLng} rotateLat={rotateLat} />
        </div>
      </motion.div>
    </section>
  );
}
