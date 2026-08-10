import { MediaGalleryCarousel, type GalleryMedia } from "@/components/ui/media-gallery-carousel";
import growthImage from "@/assets/Images/aboutus/growth.png";
import machineBg from "@/assets/Images/breadcurmbBackgrounds/machine_bg.jpg";
import railBg from "@/assets/Images/breadcurmbBackgrounds/rail_bg.jpg";
import oilBg from "@/assets/Images/breadcurmbBackgrounds/oil_bg.jpg";
import aerospaceBg from "@/assets/Images/breadcurmbBackgrounds/aerospace_bg.jpg";

const defaultImages: GalleryMedia[] = [
  { src: railBg, alt: "Rotex team at the manufacturing facility" },
  { src: growthImage, alt: "Precision machining on the factory floor" },
  { src: machineBg, alt: "Rotex team at the manufacturing facility" },
  { src: oilBg, alt: "Valve testing on the shop floor" },
  { src: aerospaceBg, alt: "Assembly line at Rotex facility" },
];

type GallerySwiperSectionProps = {
  images?: GalleryMedia[];
};

export function GallerySwiperSection({ images = defaultImages }: GallerySwiperSectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <MediaGalleryCarousel images={images} />
      </div>
    </section>
  );
}
