"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductGallery } from "@/components/ui/product-gallery";
import { VariantConfigurator } from "@/components/ui/variant-configurator";
import { ProductTabs } from "@/components/ui/product-tabs";
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

  return (
    <div className="container flex flex-col gap-16 pt-32 lg:pt-36 pb-12">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-3">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-3">
            {i > 0 && (
              <span className="text-stone-900 text-xs font-semibold font-montserrat uppercase tracking-wide">/</span>
            )}
            {crumb.href ? (
              <Link href={crumb.href} className="text-stone-900 text-sm font-semibold font-montserrat leading-5 hover:text-[#EF3E23]">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[#EF3E23] text-sm font-semibold font-montserrat leading-5">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      

      {/* Hero: info + gallery */}
      <div className="flex justify-between items-start gap-10 flex-wrap lg:flex-nowrap">
        <div className="w-full lg:max-w-144 flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-orange-600 text-xl font-bold font-montserrat uppercase tracking-[4px]">
                {product.code}
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  {tags.map((tag, i) => (
                    <span key={tag} className="flex items-center gap-2.5">
                      {i > 0 && <span className="size-1 bg-stone-900 rounded-full" />}
                      <span className="text-stone-900 text-xs font-semibold font-montserrat uppercase">{tag}</span>
                    </span>
                  ))}
                </div>
                <h1 className="text-black text-4xl font-normal font-montserrat leading-10">{product.name}</h1>
              </div>
              <p className="text-black text-base font-medium font-montserrat leading-6">{product.description}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase tracking-wide">
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

            <div className="flex flex-col gap-3">
              <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase tracking-wide">
                Certificates
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {product.certificates.map((cert) => (
                  <span
                    key={cert}
                    className="px-4 py-0.5 bg-zinc-100 rounded-full text-stone-900 text-xs font-medium font-montserrat uppercase"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleHeroQuoteClick}
            className="w-60 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 rounded-full flex justify-center items-center gap-3.5 transition-colors"
          >
            <span className="text-center text-white text-sm font-semibold font-montserrat uppercase">
              Request a Quote
            </span>
          </button>
        </div>

        <ProductGallery images={product.images} alt={product.name} />
      </div>

      {/* Variant configurator + tabs */}
      {isVariable && product.variants ? (
        <div className="flex flex-col gap-7">
          <h2 className="text-stone-900 text-4xl font-normal font-montserrat leading-10">Configure Product Variant</h2>
          <div className="flex justify-between items-start gap-10 flex-wrap lg:flex-nowrap">
            <div className="w-full lg:max-w-120">
              <VariantConfigurator
                variants={product.variants}
                onVariantChange={setSelectedVariant}
                onRequestQuote={() => setQuoteOpen(true)}
              />
            </div>
            <div className="w-full lg:max-w-170">
              <ProductTabs features={features} specifications={specifications} downloads={downloads} />
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
