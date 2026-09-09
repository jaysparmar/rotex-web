import { IoDocumentTextOutline } from "react-icons/io5";
import { DownloadIcon } from "@/components/ui/download-icon";
import type { DownloadItem } from "@/lib/downloads-data";

export function DownloadCard({ item, showCategoryTag = false }: { item: DownloadItem; showCategoryTag?: boolean }) {
  const meta = [
    item.fileType ? `.${item.fileType.toLowerCase()}` : null,
    item.fileSizeLabel,
    item.modelNo ? `Model No: ${item.modelNo}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
  const badges = showCategoryTag ? [item.categoryName].filter(Boolean) : [];

  return (
    <div className="group w-full h-full rounded-xl outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-3 p-4 bg-white transition-colors duration-200 hover:bg-[#F5F2F0]">
      <div className="flex items-start gap-3">
        <div className="shrink-0 size-10 rounded-lg bg-stone-50 flex items-center justify-center">
          <IoDocumentTextOutline className="size-5 text-stone-400" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {badges.map((label) => (
                <span
                  key={label}
                  className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-semibold font-montserrat uppercase tracking-wide leading-4"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
          <span className="text-zinc-800 text-sm font-medium font-montserrat leading-5 transition-colors duration-200 group-hover:text-red-600 truncate">
            {item.title}
          </span>
          {meta && <span className="text-neutral-400 text-xs font-medium font-montserrat leading-4 truncate">{meta}</span>}
        </div>
      </div>
      <a
        href={item.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="w-full px-4 py-2.5 bg-stone-100 rounded-[47px] flex justify-center items-center gap-2 transition-colors duration-200 group-hover:bg-[#EF3E23]"
      >
        <DownloadIcon className="size-4 text-[#EF3E23] transition-colors duration-200 group-hover:text-white" />
        <span className="text-[#EF3E23] text-xs font-semibold font-montserrat leading-5 transition-colors duration-200 group-hover:text-white">
          Download
        </span>
      </a>
    </div>
  );
}
