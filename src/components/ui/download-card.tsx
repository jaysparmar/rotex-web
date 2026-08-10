import Image from "next/image";
import { IoDownloadOutline } from "react-icons/io5";
import type { DownloadItem } from "@/lib/downloads-data";

export function DownloadCard({ item }: { item: DownloadItem }) {
  const meta = [item.language, item.fileType ? `.${item.fileType.toLowerCase()}` : null, item.fileSizeLabel]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="w-full h-full rounded-xl outline-1 -outline-offset-1 outline-neutral-200 flex flex-col">
      <div className="w-full h-36 p-4 flex items-center justify-center overflow-hidden rounded-t-xl bg-white">
        <Image src={item.image} alt={item.title} width={264} height={142} className="w-full h-full object-cover rounded-lg" unoptimized />
      </div>
      <div className="flex-1 p-5 border-t border-neutral-200 flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-neutral-400 text-xs font-medium font-montserrat leading-5">{meta}</span>
          <span className="text-zinc-800 text-lg font-medium font-montserrat leading-6">{item.title}</span>
        </div>
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="w-full px-6 py-3.5 bg-stone-100 rounded-[47px] shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] flex justify-center items-center gap-2.5 hover:bg-stone-200 transition-colors"
        >
          <IoDownloadOutline className="size-5 text-red-600" />
          <span className="text-red-600 text-sm font-semibold font-montserrat leading-5">Download</span>
        </a>
      </div>
    </div>
  );
}
