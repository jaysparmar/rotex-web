"use client";
import { useRef } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ui/product-card";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import { productHref } from "@/lib/breadcrumb";
import type { ProductSummary } from "@/lib/products-data";

const SCROLL_AMOUNT = 308; // card width (288) + gap (20)

export function ProductsSection({ products }: { products: ProductSummary[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    trackRef.current?.scrollBy({
      left: dir === "right" ? SCROLL_AMOUNT : -SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-16 lg:py-20 overflow-hidden">

      {/* Header — stays inside container */}
      <div className="container">
        <div className="flex items-center justify-between mb-9">
          <h2 className="text-gradient-orange-dark font-montserrat font-normal text-3xl lg:text-4xl leading-10">
            Engineered Flow Control Systems
          </h2>

          {/* Arrow nav */}
          <div className="flex items-center gap-7 shrink-0">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous"
              className="size-11 rounded-full bg-orange-600/10 border border-stone-200 flex items-center justify-center hover:border-orange-600 transition-colors duration-150"
            >
              <RotexArrow size={7} className="rotate-180 text-red-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next"
              className="size-11 rounded-full bg-orange-600/10 border border-stone-200 flex items-center justify-center hover:border-orange-600 transition-colors duration-150"
            >
              <RotexArrow size={7} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Card track — starts at container left edge, bleeds to right viewport edge */}
      <div
        ref={trackRef}
        className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth py-3"
        style={{
          paddingLeft: "max(1.25rem, calc((100vw - 1280px) / 2))",
          scrollbarWidth: "none",
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            name={product.name}
            description={product.category}
            image={product.image}
            href={productHref(product.slug, product.category)}
          />
        ))}
        {/* Trailing spacer so last card doesn't sit flush against viewport */}
        <div className="shrink-0 w-4" />
      </div>

      {/* CTA — back inside container */}
      <div className="container flex justify-center mt-10">
        <Link
          href="/products"
          className="px-6 py-3.5 rounded-full bg-stone-900 text-white font-montserrat font-semibold text-sm uppercase leading-5 hover:bg-stone-800 transition-colors duration-150"
        >
          View All Products
        </Link>
      </div>

    </section>
  );
}
