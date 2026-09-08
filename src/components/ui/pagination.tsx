"use client";
import { IoChevronBackOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-end items-center gap-3">
      <button
        aria-label="Previous page"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={cn(
          "size-10 rounded-full flex justify-center items-center transition-colors",
          page === 1 ? "bg-stone-300 opacity-50" : "bg-stone-100 hover:bg-stone-200"
        )}
      >
        <IoChevronBackOutline className={cn("size-3", page === 1 ? "text-white" : "text-[#EF3E23]")} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "size-10 rounded-full flex justify-center items-center text-sm font-medium font-montserrat leading-5 transition-colors",
            p === page
              ? "bg-[#EF3E23] text-white"
              : "outline-1 -outline-offset-1 outline-neutral-200 text-stone-500 hover:text-stone-900"
          )}
        >
          {p}
        </button>
      ))}

      <button
        aria-label="Next page"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={cn(
          "size-10 rounded-full flex justify-center items-center transition-colors",
          page === totalPages ? "bg-stone-300 opacity-50" : "bg-stone-100 hover:bg-stone-200"
        )}
      >
        <IoChevronBackOutline
          className={cn("size-3 rotate-180", page === totalPages ? "text-white" : "text-[#EF3E23]")}
        />
      </button>
    </div>
  );
}
