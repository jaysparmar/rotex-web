"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGallery } from "@/components/ui/product-gallery";
import { VariantConfigurator } from "@/components/ui/variant-configurator";
import { ProductTabs } from "@/components/ui/product-tabs";
import { BreadcrumbTrail } from "@/components/ui/breadcrumb-trail";
import { ProductQuoteFormInline, ProductQuoteFormSheet } from "@/components/sections/product-quote-form";
import { crumbsFromCategory } from "@/lib/breadcrumb";
import type { ProductDetail, ProductVariant } from "@/lib/product-detail-data";

export function ProductDetailContent({ product }: { product: ProductDetail }) {
  const isVariable = product.productType === "variable" && !!product.variants;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    isVariable ? product.variants?.[0] : undefined
  );
  const [quoteOpen, setQuoteOpen] = useState(false);

  const handleHeroQuoteClick = () => {
    if (isVariable) {
      setQuoteOpen(true);
    } else {
      document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const searchParams = useSearchParams();
  const navCrumbs = crumbsFromCategory(searchParams.get("category"));
  const breadcrumb = navCrumbs ? [...navCrumbs, { label: product.name }] : product.breadcrumb;

  const tags = selectedVariant
    ? [...product.tags.filter((t) => /\bway\b/i.test(t))].filter(Boolean)
    : product.tags;
  const features = selectedVariant?.features ?? product.features ?? "";
  const specifications = selectedVariant?.specifications ?? product.specifications ?? [];
  const downloads = selectedVariant?.downloads ?? product.downloads ?? [];

  // Certificates are per-variant; hero shows the union across every variant so
  // nothing set on any single variant is hidden. The tabs below show the
  // currently selected variant's own set so differences are visible.
  const heroCertificates = isVariable && product.variants
    ? Array.from(new Set(product.variants.flatMap((v) => v.certificates)))
    : product.certificates;

  return (
    <div className="container flex flex-col gap-10 lg:gap-16 pt-28 lg:pt-32 pb-12">
      {/* Breadcrumb — shows the full trail whenever it fits on one line;
          collapses the middle crumbs to "..." only once it would wrap */}
      <BreadcrumbTrail crumbs={breadcrumb} />

      {/* Hero: info + gallery */}
      <div className="flex justify-between items-start gap-10 flex-wrap lg:flex-nowrap">
        <div className="order-2 lg:order-1 w-full lg:max-w-144 flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-orange-600 text-xl font-bold font-montserrat uppercase leading-5 tracking-[4px]">
                {product.code}
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  {tags.map((tag, i) => (
                    <span key={tag} className="flex items-center gap-2.5">
                      {i > 0 && <span className="size-1 bg-stone-900 rounded-full" />}
                      <span className="text-stone-900 text-xs font-semibold font-montserrat uppercase leading-5">{tag}</span>
                    </span>
                  ))}
                </div>
                <h1 className="text-black text-2xl font-medium leading-8 lg:text-4xl lg:font-normal lg:leading-10 font-montserrat">{product.name}</h1>
              </div>
              <p className="text-stone-500 text-sm leading-5 lg:text-black lg:text-base lg:leading-6 font-medium font-montserrat">{product.description}</p>
            </div>

            {product.industriesServed.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
                  Industries served
                </p>
                <div className="flex flex-wrap items-start gap-2">
                  {product.industriesServed.map((industry, i) => (
                    <span key={industry} className="text-stone-900 text-sm font-semibold font-montserrat leading-6">
                      {industry}
                      {i < product.industriesServed.length - 1 && ","}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {heroCertificates.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
                  Certificates
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {heroCertificates.map((cert) => (
                    <span
                      key={cert}
                      className="px-4 py-0.5 bg-zinc-100 rounded-full text-stone-900 text-xs font-medium font-montserrat uppercase"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleHeroQuoteClick}
            className="w-full lg:w-60 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 rounded-full flex justify-center items-center gap-3.5 transition-colors"
          >
            <span className="text-center text-white text-sm font-semibold font-montserrat uppercase leading-5">
              Request a Quote
            </span>
          </button>
        </div>

        <div className="order-1 lg:order-2 mb-8 w-full lg:mb-0 lg:flex-1 lg:max-w-158">
          <ProductGallery images={product.images} alt={product.name} />
        </div>
      </div>

      {/* Variant configurator + tabs */}
      {isVariable && product.variants ? (
        <div className="flex flex-col gap-7">
          <h2 className="text-stone-900 text-2xl font-medium leading-8 lg:text-4xl lg:font-normal lg:leading-10 font-montserrat">
            Configure Product Variant
          </h2>
          <div className="flex justify-between items-start gap-10 flex-wrap lg:flex-nowrap">
            <div className="w-full lg:max-w-120">
              <VariantConfigurator
                variants={product.variants}
                onVariantChange={setSelectedVariant}
                onRequestQuote={() => setQuoteOpen(true)}
              />
            </div>
            <div className="w-full lg:max-w-170">
              <ProductTabs
                features={features}
                specifications={specifications}
                downloads={downloads}
                certificates={selectedVariant?.certificates ?? []}
              />
            </div>
          </div>
        </div>
      ) : (
        <ProductTabs features={features} specifications={specifications} downloads={downloads} />
      )}

      {isVariable ? (
        <ProductQuoteFormSheet
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          productCode={product.code}
          productName={product.name}
          industries={product.industriesServed}
        />
      ) : (
        <div id="quote-form">
          <ProductQuoteFormInline
            productCode={product.code}
            productName={product.name}
            industries={product.industriesServed}
          />
        </div>
      )}
    </div>
  );
}
