import Image from "next/image";
import { IoDocumentTextOutline, IoDownloadOutline } from "react-icons/io5";
import type { DownloadItem } from "@/lib/downloads-data";

const NO_IMAGE = new Set(["", "/file.svg"]);

export function DownloadCard({ item }: { item: DownloadItem }) {
  const meta = [item.language, item.fileType ? `.${item.fileType.toLowerCase()}` : null, item.fileSizeLabel]
    .filter(Boolean)
    .join(" | ");
  const hasImage = !NO_IMAGE.has(item.image);

  return (
    <div className="group w-full h-full rounded-xl outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col transition-colors duration-200">
      <div className="w-full h-36 p-4 flex items-center justify-center overflow-hidden rounded-t-xl bg-stone-50">
        {hasImage ? (
          <Image src={item.image} alt={item.title} width={264} height={142} className="w-full h-full object-cover rounded-lg" unoptimized />
        ) : (
          <IoDocumentTextOutline className="size-10 text-stone-300" />
        )}
      </div>
      <div className="flex-1 p-5 border-t border-neutral-200 flex flex-col justify-between gap-5 bg-white transition-colors duration-200 group-hover:bg-[#F5F2F0]">
        <div className="flex flex-col gap-1">
          <span className="text-neutral-400 text-xs font-medium font-montserrat leading-5">{meta}</span>
          <span className="text-zinc-800 text-lg font-medium font-montserrat leading-6 transition-colors duration-200 group-hover:text-red-600">
            {item.title}
          </span>
        </div>
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="w-full px-6 py-3.5 bg-stone-100 rounded-[47px] flex justify-center items-center gap-2.5 transition-colors duration-200 group-hover:bg-[#EF3E23]"
        >
          <IoDownloadOutline className="size-5 text-[#EF3E23] transition-colors duration-200 group-hover:text-white" />
          <span className="text-[#EF3E23] text-sm font-semibold font-montserrat leading-5 transition-colors duration-200 group-hover:text-white">
            Download
          </span>
        </a>
      </div>
    </div>
  );
}
