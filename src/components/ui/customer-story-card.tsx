import { ImageView } from "@/components/ui/image-view";
import { VideoPlayer } from "@/components/ui/video-player";
import { cn } from "@/lib/utils";

type Media =
  | { type: "image"; src: string }
  | { type: "video"; src: string };

type CustomerStoryCardProps = {
  media: Media;
  quote: string;
  author: string;
  company: string;
  className?: string;
};

export function CustomerStoryCard({ media, quote, author, company, className }: CustomerStoryCardProps) {
  return (
    <div
      className={cn(
        "shrink-0 w-full lg:w-144.5 flex flex-col lg:rounded-[10px] lg:bg-white lg:outline-1 lg:-outline-offset-1 lg:outline-neutral-200 lg:p-5 lg:gap-5",
        className
      )}
    >
      {/* Media — image or video */}
      <div className="h-48 lg:h-80 lg:rounded-lg rounded-tl-2xl rounded-tr-2xl border border-neutral-200 lg:border-0 overflow-hidden shrink-0">
        {media.type === "video" ? (
          <VideoPlayer
            src={media.src}
            variant="light"
            containerClassName="w-full h-full"
            showMuteToggle
          />
        ) : (
          <ImageView
            fill
            src={media.src}
            alt={author}
            containerClassName="w-full h-full"
            className="object-cover"
          />
        )}
      </div>

      {/* Quote + author */}
      <div className="flex flex-col gap-10 lg:gap-3 p-3.5 lg:p-0 bg-white lg:bg-transparent rounded-bl-[10px] rounded-br-2xl lg:rounded-none outline outline-1 -outline-offset-1 lg:outline-0 outline-neutral-200">
        <p className="text-stone-500 lg:text-stone-900 font-montserrat font-medium text-base leading-6">
          {quote}
        </p>

        <div className="flex flex-col gap-3.5 lg:gap-3">
          <div className="self-stretch border-t border-neutral-200" />
          {/* zinc-400 (#a1a1aa), not neutral-400 — the theme overrides neutral-400 to a dark #4a5565 */}
          <div className="flex flex-col gap-1">
            <p className="text-zinc-400 font-montserrat font-semibold lg:font-medium text-sm leading-6 lg:leading-5">{author}</p>
            <p className="text-zinc-400 font-montserrat font-semibold lg:font-medium text-sm leading-6 lg:leading-5">{company}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
