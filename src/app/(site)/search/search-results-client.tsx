"use client";

import { useEffect, useState } from "react";
import { ProductListCard, type ProductListCardProps } from "@/components/ui/product-list-card";
import { ResourceCard } from "@/components/ui/resource-card";
import { JobCard } from "@/components/ui/job-card";
import { DownloadCard } from "@/components/ui/download-card";
import { SearchDocumentsPanel } from "@/components/ui/search-documents-panel";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { DownloadItem } from "@/lib/downloads-data";
import type { SearchCounts, DocumentFilterOptions, JobSummary } from "@/lib/search-data";
import type { ResourceItem } from "@/lib/resource-types";

type Tab = "all" | "products" | "documents" | "case-studies" | "blogs" | "jobs";

const PAGE_SIZE = 12;
const DOC_PAGE_SIZE = 12;

type DocFilters = { product: string; productCertificateType: string; qualityCertificateType: string; industry: string };
const EMPTY_DOC_FILTERS: DocFilters = { product: "", productCertificateType: "", qualityCertificateType: "", industry: "" };

export function SearchResultsClient({ q }: { q: string }) {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [docFilters, setDocFilters] = useState<DocFilters>(EMPTY_DOC_FILTERS);
  const [counts, setCounts] = useState<SearchCounts>({ products: 0, documents: 0, caseStudies: 0, blogs: 0, jobs: 0, total: 0 });

  const [allProductsPreview, setAllProductsPreview] = useState<ProductListCardProps[]>([]);
  const [allIndustries, setAllIndustries] = useState<string[]>([]);
  const [allDocumentsPreview, setAllDocumentsPreview] = useState<DownloadItem[]>([]);
  const [allCaseStudiesPreview, setAllCaseStudiesPreview] = useState<ResourceItem[]>([]);
  const [allBlogsPreview, setAllBlogsPreview] = useState<ResourceItem[]>([]);
  const [allJobsPreview, setAllJobsPreview] = useState<JobSummary[]>([]);
  const [products, setProducts] = useState<ProductListCardProps[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [documents, setDocuments] = useState<DownloadItem[]>([]);
  const [documentsTotal, setDocumentsTotal] = useState(0);
  const [documentFilterOptions, setDocumentFilterOptions] = useState<DocumentFilterOptions>({
    products: [],
    productCertificateTypes: [],
    qualityCertificateTypes: [],
    industries: [],
  });
  const [caseStudies, setCaseStudies] = useState<ResourceItem[]>([]);
  const [caseStudiesTotal, setCaseStudiesTotal] = useState(0);
  const [blogs, setBlogs] = useState<ResourceItem[]>([]);
  const [blogsTotal, setBlogsTotal] = useState(0);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);

  useEffect(() => {
    setPage(1);
    setDocFilters(EMPTY_DOC_FILTERS);
  }, [tab, q]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ q, tab, page: String(page) });
    if (tab === "documents") {
      if (docFilters.product) params.set("product", docFilters.product);
      if (docFilters.productCertificateType) params.set("productCertificateType", docFilters.productCertificateType);
      if (docFilters.qualityCertificateType) params.set("qualityCertificateType", docFilters.qualityCertificateType);
      if (docFilters.industry) params.set("industry", docFilters.industry);
    }

    fetch(`/api/v1/search?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) return;
        const data = json.data;
        setCounts(data.counts);

        if (tab === "all") {
          setAllProductsPreview(data.productsPreview);
          setAllIndustries(data.industries);
          setAllDocumentsPreview(data.documentsPreview);
          setAllCaseStudiesPreview(data.caseStudiesPreview);
          setAllBlogsPreview(data.blogsPreview);
          setAllJobsPreview(data.jobsPreview);
        } else if (tab === "products") {
          setProducts(data.items);
          setProductsTotal(data.total);
        } else if (tab === "documents") {
          setDocuments(data.items);
          setDocumentsTotal(data.total);
          setDocumentFilterOptions(data.filterOptions);
        } else if (tab === "case-studies") {
          setCaseStudies(data.items);
          setCaseStudiesTotal(data.total);
        } else if (tab === "blogs") {
          setBlogs(data.items);
          setBlogsTotal(data.total);
        } else if (tab === "jobs") {
          setJobs(data.items);
          setJobsTotal(data.total);
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          // swallow other errors as before
        }
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, q, page, docFilters]);

  const allTabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All Results", count: counts.total },
    { id: "products", label: "Products", count: counts.products },
    { id: "documents", label: "Documents", count: counts.documents },
    { id: "case-studies", label: "Case Studies", count: counts.caseStudies },
    { id: "blogs", label: "Blogs", count: counts.blogs },
    { id: "jobs", label: "Jobs", count: counts.jobs },
  ];
  const tabs = allTabs.filter((t) => t.id === "all" || t.id === tab || t.count > 0);

  return (
    <div className="container pt-24 pb-10 sm:pt-28 lg:pt-32 flex flex-col gap-6 sm:gap-8">
      <h1 className="text-stone-900 font-montserrat font-normal text-3xl leading-9 sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-[58px]">
        Search results for &lsquo;{q}&rsquo;
      </h1>

      <div
        className="sticky top-20 lg:top-24 z-40 bg-white border-b border-stone-300 flex items-center gap-5 overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-2.5 py-5 border-b-2 whitespace-nowrap text-sm font-medium font-montserrat leading-5 transition-colors uppercase",
              t.id === tab ? "border-[#EF3E23] text-[#EF3E23]" : "border-transparent text-stone-900 hover:text-[#EF3E23]"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "all" && (
        <div className="flex flex-col gap-10">
          {counts.products > 0 && (
            <PreviewSection title={`Products (${counts.products})`} viewAllLabel="View All Products" onViewAll={() => setTab("products")}>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {allProductsPreview.map((p) => (
                  <ProductListCard key={p.slug} {...p} />
                ))}
              </div>
            </PreviewSection>
          )}

          {allIndustries.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-stone-900 font-montserrat font-medium text-lg sm:text-xl">Industries ({allIndustries.length})</h2>
              <div className="flex flex-wrap gap-3">
                {allIndustries.map((name) => (
                  <span key={name} className="px-4 py-2 rounded-full border border-neutral-200 text-stone-900 text-xs font-semibold font-montserrat uppercase">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {counts.documents > 0 && (
            <PreviewSection title={`Downloads (${counts.documents})`} viewAllLabel="View All Downloads" onViewAll={() => setTab("documents")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {allDocumentsPreview.map((item) => (
                  <DownloadCard key={item.id} item={item} showCategoryTag />
                ))}
              </div>
            </PreviewSection>
          )}

          {counts.caseStudies > 0 && (
            <PreviewSection title={`Case Studies (${counts.caseStudies})`} viewAllLabel="View All Case Studies" onViewAll={() => setTab("case-studies")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {allCaseStudiesPreview.map((post) => (
                  <ResourceCard key={post.id} post={post} basePath="/case-studies" />
                ))}
              </div>
            </PreviewSection>
          )}

          {counts.blogs > 0 && (
            <PreviewSection title={`Blogs (${counts.blogs})`} viewAllLabel="View All Blogs" onViewAll={() => setTab("blogs")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {allBlogsPreview.map((post) => (
                  <ResourceCard key={post.id} post={post} basePath="/blogs" />
                ))}
              </div>
            </PreviewSection>
          )}

          {counts.jobs > 0 && (
            <PreviewSection title={`Jobs (${counts.jobs})`} viewAllLabel="View All Jobs" onViewAll={() => setTab("jobs")}>
              <div className="flex flex-col gap-5">
                {allJobsPreview.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </PreviewSection>
          )}
        </div>
      )}

      {tab === "products" && (
        <div className="flex flex-col gap-5">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {products.map((p) => (
                <ProductListCard key={p.slug} {...p} />
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-center py-20">No products match your search.</p>
          )}
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(productsTotal / PAGE_SIZE))} onChange={setPage} />
        </div>
      )}

      {tab === "documents" && (
        <SearchDocumentsPanel
          items={documents}
          total={documentsTotal}
          filterOptions={documentFilterOptions}
          page={page}
          pageSize={DOC_PAGE_SIZE}
          onPageChange={setPage}
          filters={docFilters}
          onFiltersChange={setDocFilters}
        />
      )}

      {(tab === "case-studies" || tab === "blogs") && (
        <div className="flex flex-col gap-5">
          {(tab === "case-studies" ? caseStudies : blogs).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(tab === "case-studies" ? caseStudies : blogs).map((post) => (
                <ResourceCard key={post.id} post={post} basePath={`/${tab}`} />
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-center py-20">No results match your search.</p>
          )}
          <Pagination
            page={page}
            totalPages={Math.max(1, Math.ceil((tab === "case-studies" ? caseStudiesTotal : blogsTotal) / PAGE_SIZE))}
            onChange={setPage}
          />
        </div>
      )}

      {tab === "jobs" && (
        <div className="flex flex-col gap-5">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <p className="text-stone-400 text-center py-20">No jobs match your search.</p>
          )}
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(jobsTotal / PAGE_SIZE))} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

function PreviewSection({
  title,
  viewAllLabel,
  onViewAll,
  children,
}: {
  title: string;
  viewAllLabel: string;
  onViewAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-stone-900 font-montserrat font-medium text-lg sm:text-xl">{title}</h2>
        <button onClick={onViewAll} className="shrink-0 text-[#EF3E23] text-sm font-semibold font-montserrat hover:underline">
          {viewAllLabel}
        </button>
      </div>
      {children}
    </div>
  );
}
