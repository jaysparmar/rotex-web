import { MediaGalleryCarousel, type GalleryMedia } from "@/components/ui/media-gallery-carousel";

const defaultImages: GalleryMedia[] = [
  { src: "/media/career/gallery/1.png", alt: "Rotex team at the manufacturing facility", size: "wide" },
  { src: "/media/career/gallery/2.png", alt: "Precision machining on the factory floor", size: "narrow" },
  { src: "/media/career/gallery/3.png", alt: "Rotex team at the manufacturing facility", size: "wide" },
  { src: "/media/career/gallery/4.png", alt: "Valve testing on the shop floor", size: "narrow" },
];

type CareerGallerySectionProps = {
  images?: GalleryMedia[];
};

export function CareerGallerySection({ images = defaultImages }: CareerGallerySectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <MediaGalleryCarousel images={images} />
      </div>
    </section>
  );
}
